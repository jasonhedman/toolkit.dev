"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { useChat } from "@ai-sdk/react";

import { toast } from "sonner";

import { OpenRouterChecks } from "./openrouter-checks";

import { api } from "@/trpc/react";

import { useAutoResume } from "@/app/(general)/_hooks/use-auto-resume";

import { LanguageModelCapability } from "@/ai/language/types";

import { clientToolkits } from "@/toolkits/toolkits/client";

import { languageModels } from "@/ai/language";

import { clientCookieUtils } from "@/lib/cookies/client";
import { generateUUID } from "@/lib/utils";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import { ChatSDKError } from "@/lib/errors";
import { IS_DEVELOPMENT } from "@/lib/constants";
import {
  clearChatActivity,
  setChatActivityStatus,
} from "@/app/(general)/_stores/chat-activity-store";

import type { ReactNode } from "react";
import type { Attachment, UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ClientToolkit } from "@/toolkits/types";
import type { z } from "zod";
import type { SelectedToolkit } from "@/components/toolkit/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { Chat, Workbench } from "@prisma/client";
import type { PersistedToolkit } from "@/lib/cookies/types";
import type { ImageModel } from "@/ai/image/types";
import type { LanguageModel } from "@/ai/language/types";

const DEFAULT_CHAT_MODEL = languageModels[0]!;

interface ChatContextType {
  // Chat state
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  input: string;
  setInput: UseChatHelpers["setInput"];
  status: UseChatHelpers["status"];
  streamStopped: boolean;
  attachments: Array<Attachment>;
  setAttachments: (
    attachments:
      | Array<Attachment>
      | ((prev: Array<Attachment>) => Array<Attachment>),
  ) => void;
  selectedChatModel: LanguageModel | undefined;
  setSelectedChatModel: (model: LanguageModel) => void;
  useNativeSearch: boolean;
  setUseNativeSearch: (enabled: boolean) => void;
  imageGenerationModel: ImageModel | undefined;
  setImageGenerationModel: (model: ImageModel | undefined) => void;

  toolkits: Array<SelectedToolkit>;
  addToolkit: (toolkit: SelectedToolkit) => void;
  removeToolkit: (id: Toolkits) => void;

  workbench?: Workbench;

  // Chat actions
  handleSubmit: UseChatHelpers["handleSubmit"];
  stop: () => void;
  reload: UseChatHelpers["reload"];
  append: UseChatHelpers["append"];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  id: string;
  initialMessages: Array<UIMessage>;
  initialVisibilityType: "public" | "private";
  autoResume: boolean;
  workbench?: Workbench;
  initialPreferences?: {
    selectedChatModel?: LanguageModel;
    imageGenerationModel?: ImageModel;
    useNativeSearch?: boolean;
    toolkits?: Array<PersistedToolkit>;
  };
}

export function ChatProvider({
  children,
  id,
  initialMessages,
  initialVisibilityType,
  autoResume,
  workbench,
  initialPreferences,
}: ChatProviderProps) {
  const utils = api.useUtils();

  const [selectedChatModel, setSelectedChatModelState] =
    useState<LanguageModel>(
      initialPreferences?.selectedChatModel ?? DEFAULT_CHAT_MODEL,
    );
  const [useNativeSearch, setUseNativeSearchState] = useState(
    initialPreferences?.useNativeSearch ?? false,
  );
  const [imageGenerationModel, setImageGenerationModelState] = useState<
    ImageModel | undefined
  >(initialPreferences?.imageGenerationModel);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [toolkits, setToolkitsState] = useState<Array<SelectedToolkit>>(() => {
    // If this is a workbench chat, initialize with workbench toolkits
    if (workbench) {
      return workbench.toolkitIds
        .map((toolkitId) => {
          const clientToolkit =
            clientToolkits[toolkitId as keyof typeof clientToolkits];
          if (clientToolkit) {
            return {
              id: toolkitId,
              toolkit: clientToolkit,
              parameters: {}, // Use default parameters for workbench toolkits
            };
          }
          return null;
        })
        .filter(
          (
            toolkit,
          ): toolkit is {
            id: Toolkits;
            toolkit: ClientToolkit;
            parameters: z.infer<ClientToolkit["parameters"]>;
          } => toolkit !== null,
        );
    }

    // Restore toolkits by matching persisted ones with available client toolkits
    if (
      initialPreferences?.toolkits &&
      initialPreferences.toolkits.length > 0
    ) {
      return initialPreferences.toolkits
        .map((persistedToolkit) => {
          const clientToolkit =
            clientToolkits[persistedToolkit.id as keyof typeof clientToolkits];
          if (clientToolkit) {
            return {
              id: persistedToolkit.id,
              toolkit: clientToolkit,
              parameters: persistedToolkit.parameters,
            };
          }
          return null;
        })
        .filter(
          (
            toolkit,
          ): toolkit is {
            id: Toolkits;
            toolkit: ClientToolkit;
            parameters: z.infer<ClientToolkit["parameters"]>;
          } => toolkit !== null,
        );
    }

    return [];
  });
  const [hasSyncedInitialChat, setHasSyncedInitialChat] = useState(false);
  const [hasInsertedPlaceholder, setHasInsertedPlaceholder] = useState(false);
  const [streamStopped, setStreamStopped] = useState(false);
  const isStreamingRef = useRef(false);

  const chatListInput = useMemo(
    () =>
      ({
        limit: 10,
        workbenchId: workbench?.id ?? null,
      }) as const,
    [workbench?.id],
  );

  const syncChatList = useCallback(
    (attempt = 0) => {
      void (async () => {
        try {
          const latestChat = await utils.chats.getChat.fetch(id);
          if (!latestChat) return;

          const { workbench: _ignoredWorkbench, ...chatWithoutWorkbench } =
            latestChat;
          const normalizedChat = chatWithoutWorkbench as Chat;

          utils.chats.getChats.setInfiniteData(chatListInput, (cache) => {
            if (!cache) {
              return {
                pageParams: [null],
                pages: [
                  {
                    items: [normalizedChat],
                    hasMore: false,
                    nextCursor: undefined,
                  },
                ],
              };
            }

            return {
              ...cache,
              pages: cache.pages.map((page, index) => {
                if (index === 0) {
                  const existingIndex = page.items.findIndex(
                    (item) => item.id === normalizedChat.id,
                  );

                  if (existingIndex !== -1) {
                    const nextItems = [...page.items];
                    nextItems[existingIndex] = normalizedChat;
                    return {
                      ...page,
                      items: nextItems,
                    };
                  }

                  const filteredItems = page.items.filter(
                    (item) => item.id !== normalizedChat.id,
                  );
                  const nextItems = [
                    normalizedChat,
                    ...filteredItems,
                  ].slice(0, chatListInput.limit);
                  return {
                    ...page,
                    items: nextItems,
                  };
                }
                return page;
              }),
            };
          });

          setHasInsertedPlaceholder(false);
          setHasSyncedInitialChat(true);

          if (normalizedChat.title === "New Chat" && attempt < 5) {
            setTimeout(() => syncChatList(attempt + 1), 1000);
          }
        } catch (error) {
          console.error("Failed to sync chat list:", error);
        }
      })();
    },
    [chatListInput, id, utils],
  );

  // Wrapper functions that also save to cookies
  const setSelectedChatModel = (model: LanguageModel) => {
    setSelectedChatModelState(model);
    clientCookieUtils.setSelectedChatModel(model);
  };

  const setUseNativeSearch = (enabled: boolean) => {
    setUseNativeSearchState(enabled);
    clientCookieUtils.setUseNativeSearch(enabled);
  };

  const setImageGenerationModel = (model: ImageModel | undefined) => {
    setImageGenerationModelState(model);
    clientCookieUtils.setImageGenerationModel(model);
  };

  const setToolkits = (newToolkits: Array<SelectedToolkit>) => {
    setToolkitsState(newToolkits);
    clientCookieUtils.setToolkits(newToolkits);
  };

  const addToolkit = (toolkit: SelectedToolkit) => {
    setToolkits([...toolkits.filter((t) => t.id !== toolkit.id), toolkit]);
  };

  const removeToolkit = (id: Toolkits) => {
    setToolkits(toolkits.filter((t) => t.id !== id));
  };

  const {
    messages,
    setMessages,
    handleSubmit: originalHandleSubmit,
    input,
    setInput,
    append: originalAppend,
    status,
    stop,
    reload,
    experimental_resume,
    data,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    fetch: fetchWithErrorHandlers,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
      selectedChatModel: `${selectedChatModel?.provider}/${selectedChatModel?.modelId}`,
      imageGenerationModel: imageGenerationModel
        ? `${imageGenerationModel.provider}:${imageGenerationModel.modelId}`
        : undefined,
      selectedVisibilityType: initialVisibilityType,
      useNativeSearch,
      systemPrompt: workbench?.systemPrompt,
      toolkits: selectedChatModel?.capabilities?.includes(
        LanguageModelCapability.ToolCalling,
      )
        ? toolkits.map((t) => ({
            id: t.id,
            parameters: t.parameters,
          }))
        : [],
      workbenchId: workbench?.id,
    }),
    onFinish: () => {
      isStreamingRef.current = false;
      setChatActivityStatus(id, false);
      setStreamStopped(false);
      void utils.messages.getMessagesForChat.invalidate({ chatId: id });
      if (initialMessages.length === 0 && !hasSyncedInitialChat) {
        syncChatList();
      }
    },
    onError: (error) => {
      isStreamingRef.current = false;
      setChatActivityStatus(id, false);
      if (
        initialMessages.length === 0 &&
        hasInsertedPlaceholder &&
        !hasSyncedInitialChat
      ) {
        utils.chats.getChats.setInfiniteData(chatListInput, (cache) => {
          if (!cache) return cache;

          return {
            ...cache,
            pages: cache.pages.map((page) => ({
              ...page,
              items: page.items.filter((chat) => chat.id !== id),
            })),
          };
        });
        setHasInsertedPlaceholder(false);
        setHasSyncedInitialChat(false);
      }

      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      } else {
        console.error(error);
        toast.error("An error occurred while processing your request");
      }
    },
  });

  const onStreamError = useCallback(() => {
    // Mark stream as stopped to hide thinking message
    setStreamStopped(true);
    // Also call stop to change the status away from 'submitted'
    stop();
  }, [stop]);

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume,
    data,
    setMessages,
    onStreamError,
  });

  const promoteChatInCache = useCallback(() => {
    utils.chats.getChats.setInfiniteData(chatListInput, (cache) => {
      if (!cache) {
        return cache;
      }

      const pages = cache.pages.map((page) => ({
        ...page,
        items: [...page.items],
      }));

      let promotedChat: Chat | undefined;

      for (const page of pages) {
        const existingIndex = page.items.findIndex((chat) => chat.id === id);
        if (existingIndex !== -1) {
          const [chat] = page.items.splice(existingIndex, 1);
          if (!promotedChat) {
            promotedChat = chat;
          }
        }
      }

      if (!promotedChat) {
        return cache;
      }

      let carry: Chat | undefined = promotedChat;

      for (let pageIndex = 0; pageIndex < pages.length && carry; pageIndex += 1) {
        const page = pages[pageIndex];
        page.items.unshift(carry);

        if (page.items.length > chatListInput.limit) {
          carry = page.items.pop();
        } else {
          carry = undefined;
        }
      }

      if (carry) {
        const lastPage = pages[pages.length - 1];
        if (lastPage) {
          lastPage.items.push(carry);
        }
      }

      return {
        ...cache,
        pages,
      };
    });
  }, [chatListInput, id, utils]);

  const handleSubmit: UseChatHelpers["handleSubmit"] = (
    event,
    chatRequestOptions,
  ) => {
    // Reset stream stopped flag when submitting new message
    setStreamStopped(false);
    isStreamingRef.current = true;
    setChatActivityStatus(id, true);

    promoteChatInCache();

    if (initialMessages.length === 0 && !hasInsertedPlaceholder) {
      setHasInsertedPlaceholder(true);
      const placeholderChat: Chat = {
        id,
        title: "New Chat",
        userId: "",
        visibility: initialVisibilityType,
        parentChatId: null,
        workbenchId: workbench?.id ?? null,
        starred: false,
        createdAt: new Date(),
      };

      utils.chats.getChats.setInfiniteData(chatListInput, (cache) => {
        if (!cache) {
          return {
            pageParams: [null],
            pages: [
              {
                items: [placeholderChat],
                hasMore: false,
                nextCursor: undefined,
              },
            ],
          };
        }

        const alreadyExists = cache.pages.some((page) =>
          page.items.some((chat) => chat.id === id),
        );

        if (alreadyExists) {
          return cache;
        }

        return {
          ...cache,
          pages: cache.pages.map((page, index) => {
            if (index === 0) {
              const nextItems = [placeholderChat, ...page.items].slice(
                0,
                chatListInput.limit,
              );
              return {
                ...page,
                items: nextItems,
              };
            }
            return page;
          }),
        };
      });
    }

    originalHandleSubmit(event, chatRequestOptions);
  };

  const appendWithPromotion = useCallback<UseChatHelpers["append"]>(
    async (message, options) => {
      promoteChatInCache();
      await originalAppend(message, options);
    },
    [originalAppend, promoteChatInCache],
  );

  useEffect(() => {
    const isStreaming =
      !streamStopped && (status === "submitted" || status === "streaming");

    isStreamingRef.current = isStreaming;
    setChatActivityStatus(id, isStreaming);

    return () => {
      if (!isStreamingRef.current) {
        clearChatActivity(id);
      }
    };
  }, [id, status, streamStopped]);

  useEffect(() => {
    if (
      selectedChatModel?.capabilities?.includes(
        LanguageModelCapability.WebSearch,
      )
    ) {
      setUseNativeSearch(true);
    } else {
      setUseNativeSearch(false);
    }
  }, [selectedChatModel]);

  const value = {
    messages,
    setMessages,
    input,
    setInput,
    status,
    streamStopped,
    attachments,
    setAttachments,
    selectedChatModel,
    setSelectedChatModel,
    useNativeSearch,
    setUseNativeSearch,
    handleSubmit,
    stop,
    reload,
    append: appendWithPromotion,
    imageGenerationModel,
    setImageGenerationModel,
    toolkits,
    addToolkit,
    removeToolkit,
    workbench,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      {IS_DEVELOPMENT && <OpenRouterChecks />}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
