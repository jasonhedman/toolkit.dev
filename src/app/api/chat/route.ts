import { after } from "next/server";

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  tool,
} from "ai";

import { createResumableStreamContext } from "resumable-stream";

import { differenceInSeconds } from "date-fns";

import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { createServerOnlyCaller } from "@/server/api/root";

import { postRequestBodySchema, type PostRequestBody } from "./schema";

import { generateText, streamText } from "@/ai/language/generate";
import { generateUUID } from "@/lib/utils";

import { ChatSDKError } from "@/lib/errors";

import type { ResumableStreamContext } from "resumable-stream";
import type {
  ModelMessage,
  Tool,
  UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { getServerToolkit } from "@/toolkits/toolkits/server";
import { languageModels } from "@/ai/language";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("REDIS_URL")) {
        console.warn(
          " > Resumable streams are disabled due to missing REDIS_URL",
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    requestBody = postRequestBodySchema.parse(await request.json());
  } catch (error) {
    console.error(error);
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedVisibilityType,
      selectedChatModel,
      useNativeSearch,
      systemPrompt,
      toolkits,
      workbenchId,
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    // const messageCount = await api.messages.getMessageCountByUserId();

    // if (messageCount > 100) {
    //   return new ChatSDKError("rate_limit:chat").toResponse();
    // }

    const chat = await api.chats.getChat(id);

    if (!chat) {
      // Start title generation in parallel (don't await)
      const titlePromise = generateTitleFromUserMessage(message);

      // Create chat with temporary title immediately
      await api.chats.createChat({
        id,
        userId: session.user.id,
        title: "New Chat", // Temporary title
        visibility: selectedVisibilityType,
        workbenchId,
      });

      // Update title in the background
      titlePromise
        .then(async (generatedTitle) => {
          try {
            await api.chats.updateChatTitle({ id, title: generatedTitle });
          } catch (error) {
            console.error("Failed to update chat title:", error);
          }
        })
        .catch((error: unknown) => {
          console.error("Failed to generate chat title:", error);
        });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    }

    const previousMessages = await api.messages.getMessagesForChat({
      chatId: id,
    });

    // In v5, we need to handle message structure differently
    // The UI messages from DB need to be prepared for streaming
    const dbMessages = previousMessages;
    const userMessage = message;

    await api.messages.createMessage({
      chatId: id,
      id: message.id,
      role: "user",
      parts: message.parts,
      attachments:
        message.experimental_attachments?.map((attachment) => ({
          url: attachment.url,
          name: attachment.name,
          contentType: attachment.contentType,
        })) ?? [],
      modelId: "user",
    });

    const streamId = generateUUID();
    await api.streams.createStreamId({ streamId, chatId: id });

    const toolkitTools = await Promise.all(
      toolkits.map(async ({ id, parameters }) => {
        const toolkit = getServerToolkit(id);
        const tools = await toolkit.tools(parameters);
        return Object.keys(tools).reduce(
          (acc, toolName) => {
            const serverTool = tools[toolName as keyof typeof tools];
            acc[`${id}_${toolName}`] = tool({
              description: serverTool.description,
              inputSchema: serverTool.inputSchema,
              execute: async (args) => {
                try {
                  const result = await serverTool.callback(args);

                  // Increment tool usage on successful execution
                  try {
                    const serverCaller = await createServerOnlyCaller();
                    await serverCaller.tools.incrementToolUsageServer({
                      toolkit: id,
                      tool: toolName,
                    });
                  } catch (error) {
                    console.error("Failed to increment tool usage:", error);
                  }

                  if (serverTool.message) {
                    return {
                      result,
                      message:
                        typeof serverTool.message === "function"
                          ? serverTool.message(result)
                          : serverTool.message,
                    };
                  } else {
                    return {
                      result,
                    };
                  }
                } catch (error) {
                  console.error(error);
                  return {
                    isError: true,
                    result: {
                      error:
                        error instanceof Error
                          ? error.message
                          : "An error occurred while executing the tool",
                    },
                  };
                }
              },
            });
            return acc;
          },
          {} as Record<string, Tool>,
        );
      }),
    );

    // Collect toolkit system prompts
    const toolkitSystemPrompts = await Promise.all(
      toolkits.map(async ({ id }) => {
        const toolkit = getServerToolkit(id);
        return toolkit.systemPrompt;
      }),
    );

    const tools = toolkitTools.reduce(
      (acc, toolkitTools) => {
        return {
          ...acc,
          ...toolkitTools,
        };
      },
      {} as Record<string, Tool>,
    );

    const isOpenAi = selectedChatModel.startsWith("openai");

    // Build comprehensive system prompt
    const baseSystemPrompt = `You are a helpful assistant. The current date and time is ${new Date().toLocaleString()}. Whenever you are asked to write code, you must include a language with \`\`\``;

    const toolkitInstructions =
      toolkitSystemPrompts.length > 0
        ? `\n\n## Available Toolkits\n\nYou have access to the following toolkits and their capabilities:\n\n${toolkitSystemPrompts.join("\n\n---\n\n")}\n\n${systemPrompt ?? ""}`
        : "";

    const fullSystemPrompt = baseSystemPrompt + toolkitInstructions;

    // Convert DB messages and add user message for model consumption
    const allMessages = [...dbMessages, userMessage];

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const result = streamText(
          `${selectedChatModel}${useNativeSearch ? ":search" : ""}`,
          {
            system: fullSystemPrompt,
            messages: convertToModelMessages(allMessages as any),
            stopWhen: (options) => options.steps.length >= 15,
            experimental_transform: smoothStream({ chunking: "word" }),
            onError: (error: unknown) => {
              console.error("Stream error occurred:", error);

              // Check if it's a 402 error and log it specifically
              if (error && typeof error === "object") {
                const errorStr = JSON.stringify(error);
                if (
                  errorStr.includes("402") ||
                  errorStr.includes("requires more credits")
                ) {
                  console.error(
                    "OpenRouter credits exhausted - 402 error detected",
                  );
                }
              }

              // Send error to frontend - this will trigger onStreamError which calls stop()
              writer.write({
                type: "data-error",
                data: {
                  type: "error",
                  message: "An error occurred while processing your request",
                },
              });

              // Don't throw - just let the stream end naturally after sending error data
            },
            onFinish: async ({ response }) => {
              // Get the actual model used from OpenRouter's response
              const [provider, modelId] = response.modelId.split("/");

              // Try to find the model in our list first
              const model = languageModels.find(
                (model) =>
                  model.provider === provider && model.modelId === modelId,
              );

              // Create model info from OpenRouter's response if not in our list
              const modelInfo = model ?? {
                name: `${provider}/${modelId}`, // Format nicely for display
                provider: provider ?? "unknown",
                modelId: modelId ?? "unknown",
              };

              // Write the model annotation
              writer.write({
                type: "data-model",
                data: {
                  type: "model",
                  model: modelInfo,
                },
              });

              // Send modelId as message annotation
              if (session.user?.id) {
                try {
                  const assistantId = generateUUID();

                  // In v5, we need to reconstruct the assistant message from the response
                  const assistantMessage = response.messages.find(m => m.role === "assistant");
                  let messageParts: Array<{ type: "text"; text: string }> = [];
                  
                  if (assistantMessage) {
                    if (typeof assistantMessage.content === "string") {
                      messageParts = [{ type: "text", text: assistantMessage.content }];
                    } else if (Array.isArray(assistantMessage.content)) {
                      messageParts = assistantMessage.content
                        .filter((content: any) => content.type === "text" && content.text)
                        .map((content: any) => ({
                          type: "text" as const,
                          text: content.text,
                        }));
                    }
                  }

                  await api.messages.createMessage({
                    chatId: id,
                    id: assistantId,
                    role: "assistant",
                    parts: messageParts,
                    attachments: [],
                    modelId: response.modelId, // Use the actual model from OpenRouter's response
                  });
                } catch (error) {
                  console.error(error);
                }
              }
            },
            tools: {
              ...tools,
              // TODO: Update web search integration for AI SDK v5
              // The webSearchPreview tool structure has changed in v5
            },
          },
        );

        void result.consumeStream();

        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({ stream });

    const streamContext = getStreamContext();

    if (streamContext) {
      // Note: In v5, resumable streams need to be adapted for UI message streams
      // For now, we'll return the stream directly and handle resumability later
      return stream;
    } else {
      return stream;
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error("Unexpected error in chat route:", error);
    return new ChatSDKError("bad_request:api").toResponse();
  }
}

async function generateTitleFromUserMessage(message: UIMessage) {
  const { text: title } = await generateText("openai/gpt-4o-mini", {
    system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - the title should be in the same language as the user's message
      - the title does not need to be a full sentence, try to pack in the most important information in a few words
      - do not use quotes or colons`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: message.parts?.find(part => part.type === "text")?.text || "",
          },
        ],
      },
    ],
  });

  return title;
}

type ResponseMessageWithoutId = ModelMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };
function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  let chat: NonNullable<Awaited<ReturnType<typeof api.chats.getChat>>>;

  try {
    const dbChat = await api.chats.getChat(chatId);

    if (!dbChat) {
      return new ChatSDKError("not_found:chat").toResponse();
    }

    chat = dbChat;
  } catch {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  if (!chat) {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  if (chat.visibility === "private" && chat.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const streamIds = await api.streams.getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const emptyStream = createUIMessageStream({
    execute: () => {
      return;
    },
  });

  // For v5, we'll temporarily disable resumable streams for the GET endpoint
  // as it needs additional adaptation work
  return createUIMessageStreamResponse({ stream: emptyStream });

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   * 
   * Note: This logic is temporarily disabled during v5 migration
   */
  /*
  if (!stream) {
    const messages = await api.messages.getMessagesForChat({ chatId: chatId! });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return createUIMessageStreamResponse({ stream: emptyStream });
    }

    if (mostRecentMessage.role !== "assistant") {
      return createUIMessageStreamResponse({ stream: emptyStream });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return createUIMessageStreamResponse({ stream: emptyStream });
    }

    const restoredStream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: "data-append",
          data: {
            type: "append-message",
            message: JSON.stringify(mostRecentMessage),
          },
        });
      },
    });

    return createUIMessageStreamResponse({ stream: restoredStream });
  }

  return new Response(stream, { status: 200 });
  */
}
