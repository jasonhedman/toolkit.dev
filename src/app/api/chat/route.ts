import { NextRequest } from "next/server";

import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";

import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { createServerOnlyCaller } from "@/server/api/root";
import { getServerToolkit } from "@/toolkits/toolkits/server";
import { imageModelRegistry } from "@/ai/image/registry";
import { generateUUID } from "@/lib/utils";

import { postRequestBodySchema, type PostRequestBody } from "./schema";

import { generateText } from "@/ai/language/generate";

import { ChatSDKError } from "@/lib/errors";

import type { UIMessage } from "ai";
import type { Chat } from "@prisma/client";
import { languageModels } from "@/ai/language";

export const maxDuration = 60;

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
    const messages = [...previousMessages, message];

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
            (acc as Record<string, unknown>)[`${id}_${toolName}`] = tool({
              description: serverTool.description,
              parameters: (serverTool as { inputSchema: unknown }).inputSchema,
              execute: async (args: unknown) => {
                try {
                  const result = await serverTool.callback(
                    args as Record<string, unknown>,
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
            });
            return acc as Record<string, unknown>;
          },
          {} as Record<string, unknown>,
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
      {} as Record<string, unknown>,
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
        messages: messages as unknown,
        toolCallStreaming: true,
        experimental_transform: { chunking: "word" },
        experimental_generateMessageId: generateUUID,
        tools: {
          ...tools,
          ...(isOpenAi && useNativeSearch
            ? { web_search_preview: openai.tools.webSearchPreview() }
            : {}),
        },
      },
    );

    return (
      result as { toUIMessageStreamResponse: (options: unknown) => unknown }
    ).toUIMessageStreamResponse({
      sendReasoning: true,
      onError: (error: unknown) => {
        if (error && typeof error === "object") {
          const errorStr = JSON.stringify(error);
          if (
            errorStr.includes("402") ||
            errorStr.includes("requires more credits")
          ) {
            console.error("OpenRouter credits exhausted - 402 error detected");
          }
        }
        return "An error occurred while processing your request";
      },
      onFinish: async ({
        _response,
        messages,
      }: {
        _response: unknown;
        messages: unknown[];
      }) => {
        const assistant = messages[messages.length - 1] as {
          parts?: unknown[];
        };
        if (assistant) {
          try {
            await api.messages.createMessage({
              chatId: id,
              role: "assistant",
              parts: assistant.parts ?? [],
            });
          } catch (error) {
            console.error("Failed to persist assistant message:", error);
          }
        }
      },
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error("Unexpected error in chat route:", error);
    return new ChatSDKError("bad_request:api").toResponse();
  }
}

async function generateTitleFromUserMessage(message: UIMessage) {
  const userText = (message.parts ?? [])
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("\n");

  const { text: title } = await generateText("openai/gpt-4o-mini", {
    system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - the title should be in the same language as the user's message
      - the title does not need to be a full sentence, try to pack in the most important information in a few words
      - do not use quotes or colons`,
    prompt: userText,
  });

  return title;
}

// kept for backwards compatibility if needed in future edits

// GET handler removed; v5 transport may reconnect without server endpoint in this app
