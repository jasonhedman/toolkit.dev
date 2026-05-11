import { after } from "next/server";

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  tool,
  UI_MESSAGE_STREAM_HEADERS,
  type Tool,
} from "ai";

import { openai } from "@ai-sdk/openai";
import { createResumableStreamContext } from "resumable-stream";

import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { createServerOnlyCaller } from "@/server/api/root";

import { postRequestBodySchema, type PostRequestBody } from "./schema";

import { generateText, streamText } from "@/ai/language/generate";
import { generateUUID } from "@/lib/utils";

import { ChatSDKError } from "@/lib/errors";

import type { ResumableStreamContext } from "resumable-stream";
import type {
  ChatMessageMetadata,
  AppUIMessage,
  ChatAttachment,
} from "@/app/(general)/_types/chat";
import {
  attachmentToFilePart,
  getMessageAttachments,
} from "@/app/(general)/_types/chat";
import type { Message } from "@prisma/client";
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

function createEmptyUIMessageStream() {
  return createUIMessageStream<AppUIMessage>({
    execute: () => {
      return;
    },
  });
}

function createEmptySseStream() {
  return createEmptyUIMessageStream().pipeThrough(
    new JsonToSseTransformStream(),
  );
}

function getModelMetadata(
  modelIdValue?: string | null,
): ChatMessageMetadata | undefined {
  if (!modelIdValue || modelIdValue === "user") {
    return undefined;
  }

  const normalizedModelId = modelIdValue.replace(/:search$/, "");
  const [provider, modelId] = normalizedModelId.split("/");

  const model = languageModels.find(
    (model) => model.provider === provider && model.modelId === modelId,
  );

  return {
    model:
      model ??
      ({
        name: `${provider}/${modelId}`,
        provider: provider ?? "unknown",
        modelId: modelId ?? "unknown",
      } satisfies NonNullable<ChatMessageMetadata["model"]>),
  };
}

function convertDbMessageToUIMessage(message: Message): AppUIMessage {
  const parts = (message.parts as unknown as AppUIMessage["parts"]) ?? [];
  const hasFileParts = parts.some((part) => part.type === "file");
  const attachments = (
    (message.attachments as unknown as Array<ChatAttachment>) ?? []
  )
    .filter((attachment) => attachment.url)
    .map(attachmentToFilePart);

  return {
    id: message.id,
    role: message.role as AppUIMessage["role"],
    parts: [...parts, ...(hasFileParts ? [] : attachments)],
    createdAt: message.createdAt,
    metadata: getModelMetadata(message.modelId),
  };
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

    const messages = [
      ...previousMessages.map(convertDbMessageToUIMessage),
      message,
    ];

    await api.messages.createMessage({
      chatId: id,
      id: message.id,
      role: "user",
      parts: message.parts,
      attachments: getMessageAttachments(message),
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
                  const result = await serverTool.callback(
                    serverTool.inputSchema.parse(args),
                  );

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
            }) as Tool;
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
    const allTools = {
      ...tools,
      ...(isOpenAi && useNativeSearch
        ? { web_search_preview: openai.tools.webSearchPreview({}) as Tool }
        : {}),
    };

    // Build comprehensive system prompt
    const baseSystemPrompt = `You are a helpful assistant. The current date and time is ${new Date().toLocaleString()}. Whenever you are asked to write code, you must include a language with \`\`\``;

    const toolkitInstructions =
      toolkitSystemPrompts.length > 0
        ? `\n\n## Available Toolkits\n\nYou have access to the following toolkits and their capabilities:\n\n${toolkitSystemPrompts.join("\n\n---\n\n")}`
        : "";

    const fullSystemPrompt =
      baseSystemPrompt +
      toolkitInstructions +
      (systemPrompt ? `\n\n${systemPrompt}` : "");

    const result = streamText(
      `${selectedChatModel}${useNativeSearch ? ":search" : ""}`,
      {
        system: fullSystemPrompt,
        messages: convertToModelMessages(messages, {
          tools: allTools,
          ignoreIncompleteToolCalls: true,
        }),
        stopWhen: stepCountIs(15),
        experimental_transform: smoothStream({ chunking: "word" }),
        onError: ({ error }) => {
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
        },
        tools: allTools,
      },
    );

    const uiMessageStream = result.toUIMessageStream<AppUIMessage>({
      originalMessages: messages,
      generateMessageId: generateUUID,
      sendReasoning: true,
      messageMetadata: () => getModelMetadata(selectedChatModel),
      onFinish: async ({ responseMessage, isAborted }) => {
        if (isAborted || !session.user?.id) {
          return;
        }

        try {
          await api.messages.createMessage({
            chatId: id,
            id: responseMessage.id,
            role: "assistant",
            parts: responseMessage.parts,
            attachments: getMessageAttachments(responseMessage),
            modelId: selectedChatModel,
          });
        } catch (error) {
          console.error(error);
        }
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      const sseStream = uiMessageStream.pipeThrough(
        new JsonToSseTransformStream(),
      );
      const resumableStream = await streamContext.resumableStream(
        streamId,
        () => sseStream,
      );

      return new Response(resumableStream, {
        headers: UI_MESSAGE_STREAM_HEADERS,
      });
    }

    return createUIMessageStreamResponse({
      stream: uiMessageStream,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error("Unexpected error in chat route:", error);
    return new ChatSDKError("bad_request:api").toResponse();
  }
}

async function generateTitleFromUserMessage(message: AppUIMessage) {
  const { text: title } = await generateText("openai/gpt-4o-mini", {
    system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - the title should be in the same language as the user's message
      - the title does not need to be a full sentence, try to pack in the most important information in a few words
      - do not use quotes or colons`,
    messages: convertToModelMessages([message]),
  });

  return title;
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

  const chat = await api.chats.getChat(chatId);

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

  const stream = await streamContext.resumableStream(
    recentStreamId,
    createEmptySseStream,
  );

  return new Response(stream ?? createEmptySseStream(), {
    status: 200,
    headers: UI_MESSAGE_STREAM_HEADERS,
  });
}
