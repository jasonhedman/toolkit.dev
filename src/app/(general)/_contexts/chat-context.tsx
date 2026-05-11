"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { toast } from "sonner";

import { OpenRouterChecks } from "./openrouter-checks";

import { api } from "@/trpc/react";

import { LanguageModelCapability } from "@/ai/language/types";

import { clientToolkits } from "@/toolkits/toolkits/client";

import { languageModels } from "@/ai/language";

import { clientCookieUtils } from "@/lib/cookies/client";
import { generateUUID } from "@/lib/utils";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import { ChatSDKError } from "@/lib/errors";
import { IS_DEVELOPMENT } from "@/lib/constants";

import type { ReactNode } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ClientToolkit } from "@/toolkits/types";
import type { z } from "zod";
import type { SelectedToolkit } from "@/components/toolkit/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { Workbench } from "@prisma/client";
import type { PersistedToolkit } from "@/lib/cookies/types";
import type { ImageModel } from "@/ai/image/types";
import type { LanguageModel } from "@/ai/language/types";
import type { AppUIMessage, ChatAttachment } from "../_types/chat";

const DEFAULT_CHAT_MODEL = languageModels[0]!;

interface ChatContextType {
  // Chat state
  messages: Array<AppUIMessage>;
  setMessages: UseChatHelpers<AppUIMessage>["setMessages"];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  status: UseChatHelpers<AppUIMessage>["status"];
  streamStopped: boolean;
  attachments: Array<ChatAttachment>;
  setAttachments: (
    attachments:
      | Array<ChatAttachment>
      | ((prev: Array<ChatAttachment>) => Array<ChatAttachment>),
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
  sendMessage: UseChatHelpers<AppUIMessage>["sendMessage"];
  stop: UseChatHelpers<AppUIMessage>["stop"];
  regenerate: UseChatHelpers<AppUIMessage>["regenerate"];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  id: string;
  initialMessages: Array<AppUIMessage>;
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
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<ChatAttachment>>([]);
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
  const [hasInvalidated, setHasInvalidated] = useState(false);
  const [streamStopped, setStreamStopped] = useState(false);
  const requestConfigRef = useRef({
    selectedChatModel,
    imageGenerationModel,
    useNativeSearch,
    initialVisibilityType,
    workbench,
    toolkits,
  });

  requestConfigRef.current = {
    selectedChatModel,
    imageGenerationModel,
    useNativeSearch,
    initialVisibilityType,
    workbench,
    toolkits,
  };

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

  const transport = useMemo(
    () =>
      new DefaultChatTransport<AppUIMessage>({
        fetch: fetchWithErrorHandlers,
        prepareSendMessagesRequest: ({ messages }) => {
          const config = requestConfigRef.current;
          const message = messages.at(-1);

          return {
            body: {
              id,
              message,
              selectedChatModel: `${config.selectedChatModel?.provider}/${config.selectedChatModel?.modelId}`,
              imageGenerationModel: config.imageGenerationModel
                ? `${config.imageGenerationModel.provider}:${config.imageGenerationModel.modelId}`
                : undefined,
              selectedVisibilityType: config.initialVisibilityType,
              useNativeSearch: config.useNativeSearch,
              systemPrompt: config.workbench?.systemPrompt,
              toolkits: config.selectedChatModel?.capabilities?.includes(
                LanguageModelCapability.ToolCalling,
              )
                ? config.toolkits.map((t) => ({
                    id: t.id,
                    parameters: t.parameters,
                  }))
                : [],
              workbenchId: config.workbench?.id,
            },
          };
        },
        prepareReconnectToStreamRequest: () => ({
          api: `/api/chat?chatId=${id}`,
        }),
      }),
    [id],
  );

  const { messages, setMessages, status, stop, regenerate, sendMessage } =
    useChat<AppUIMessage>({
      id,
      messages: initialMessages,
      experimental_throttle: 100,
      generateId: generateUUID,
      transport,
      resume: autoResume,
      onFinish: () => {
        setStreamStopped(false);
        void utils.messages.getMessagesForChat.invalidate({ chatId: id });
        if (initialMessages.length === 0 && !hasInvalidated) {
          setHasInvalidated(true);
          void utils.chats.getChats.invalidate({
            workbenchId: workbench?.id,
          });
        }
      },
      onError: (error) => {
        if (error instanceof ChatSDKError) {
          toast.error(error.message);
        } else {
          console.error(error);
          toast.error("An error occurred while processing your request");
        }
      },
      onData: (part) => {
        if (part.type === "data-error") {
          const data = part.data;
          const message =
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
              ? data.message
              : "An error occurred while processing your request";

          toast.error(message);
          void stop();
          setStreamStopped(true);
        }
      },
    });

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
    stop,
    regenerate,
    sendMessage,
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
