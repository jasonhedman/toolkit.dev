import { after } from "next/server";

import { convertToModelMessages, stepCountIs, tool } from "ai";

import { createResumableStreamContext } from "resumable-stream";

// import { differenceInSeconds } from "date-fns";

import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { createServerOnlyCaller } from "@/server/api/root";

import { postRequestBodySchema, type PostRequestBody } from "./schema";

import { generateText, streamText } from "@/ai/language/generate";
import { generateUUID } from "@/lib/utils";

import { ChatSDKError } from "@/lib/errors";

import type { ResumableStreamContext } from "resumable-stream";
import type { CoreAssistantMessage, CoreToolMessage, Tool, UIMessage } from "ai";
import type { Chat } from "@prisma/client";
import { openai } from "@ai-sdk/openai";
import { getServerToolkit } from "@/toolkits/toolkits/server";
// import { languageModels } from "@/ai/language";

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
      const titlePromise = generateTitleFromUserMessage(
        extractTextFromParts(message.parts as Array<IncomingTextPart | IncomingFilePart>),
      );

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

  const previousMessages = await api.messages.getMessagesForChat({ chatId: id });
    // Normalize incoming message into a UIMessage with required fields
    const uiUserMessage: UIMessage = {
      id: message.id,
      createdAt: message.createdAt,
      role: "user",
      parts: message.parts.map((p) =>
        p.type === "file"
          ? ({
              type: "file",
              url: p.url,
              filename: p.filename,
              mediaType: p.mediaType ?? "application/octet-stream",
            } as const)
          : p,
      ),
    } as UIMessage;

    // v5: previousMessages are already stored as UIMessage parts; append the normalized incoming UI message
    const messages: UIMessage[] = [
      ...((previousMessages as unknown) as UIMessage[]),
      uiUserMessage,
    ];

    await api.messages.createMessage({
      chatId: id,
      id: message.id,
      role: "user",
      parts: message.parts,
      attachments:
        message.parts
          ?.filter((p): p is Extract<PostRequestBody["message"]["parts"][number], { type: "file" }> => p.type === "file")
          .map((p) => ({
            url: p.url,
            name: p.filename ?? "",
            contentType: p.mediaType,
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

    const result = streamText(
      `${selectedChatModel}${useNativeSearch ? ":search" : ""}`,
      {
        system: fullSystemPrompt,
        messages: convertToModelMessages(
          messages.map(({ id: _id, ...rest }) => rest as Omit<UIMessage, "id">),
        ),
        stopWhen: stepCountIs(15),
        onError: (error) => {
          console.error("Stream error occurred:", error);
          if (error && typeof error === "object") {
            const errorStr = JSON.stringify(error);
            if (
              errorStr.includes("402") ||
              errorStr.includes("requires more credits")
            ) {
              console.error("OpenRouter credits exhausted - 402 error detected");
            }
          }
        },
  onFinish: async ({ response }) => {
          if (session.user?.id) {
            try {
              const assistantMessages = response.messages.filter(
                (m) => m.role === "assistant",
              );
              const assistantId = getTrailingMessageId({
                messages: assistantMessages as any,
              });

              if (!assistantId) {
                throw new Error("No assistant message found!");
              }

              const assistantMessage = assistantMessages.at(-1);

              if (!assistantMessage) {
                throw new Error("No assistant message found!");
              }

              await api.messages.createMessage({
                chatId: id,
                id: assistantId,
                role: "assistant",
                // Persist the final assistant text as a single text part
                parts: response && typeof (response as any).text === "string"
                  ? [{ type: "text", text: (response as any).text }]
                  : [],
                attachments: [],
                modelId: response.modelId,
              });
            } catch (error) {
              console.error(error);
            }
          }
        },
        tools: {
          ...tools,
          ...(isOpenAi && useNativeSearch
            ? { web_search_preview: openai.tools.webSearchPreview({}) }
            : {}),
        },
      },
    );

    const stream = result.toUIMessageStream({
      originalMessages: messages,
      generateMessageId: generateUUID,
      sendReasoning: true,
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
  await streamContext.resumableStream(streamId, () => stream as unknown as ReadableStream<string>),
      );
    } else {
      return new Response(stream);
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error("Unexpected error in chat route:", error);
    return new ChatSDKError("bad_request:api").toResponse();
  }
}

type IncomingTextPart = { type: "text"; text: string };
type IncomingFilePart = {
  type: "file";
  url: string;
  filename?: string;
  mediaType?: string;
};

function extractTextFromParts(
  parts: Array<IncomingTextPart | IncomingFilePart>,
): string {
  try {
    return parts
      .filter(
        (p): p is IncomingTextPart =>
          !!p && p.type === "text" && typeof (p as IncomingTextPart).text === "string",
      )
      .map((p) => p.text)
      .join("\n")
      .slice(0, 2000); // limit prompt size
  } catch {
    return "";
  }
}

async function generateTitleFromUserMessage(text: string) {
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
        content: text ?? "",
      },
    ],
  });

  return title;
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
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

  let chat: Chat;

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

  // eslint-disable-next-line @typescript-eslint/consistent-generic-constructors
  const emptyDataStream: ReadableStream<string> = new ReadableStream({
    start(controller) {
      controller.close();
    },
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream,
  );

  // If no resumable stream is available, return an empty stream to signal completion
  if (!stream) {
    return new Response(emptyDataStream, { status: 200 });
  }

  return new Response(stream, { status: 200 });
}
