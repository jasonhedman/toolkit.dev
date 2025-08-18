"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";

import { OpenRouterChecks } from "./openrouter-checks";
import { api } from "@/trpc/react";
import { useAutoResume } from "@/app/(general)/_hooks/use-auto-resume";
import { LanguageModelCapability } from "@/ai/language/types";
import { clientToolkits } from "@/toolkits/toolkits/client";
import { languageModels } from "@/ai/language";
import { clientCookieUtils } from "@/lib/cookies/client";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import { ChatSDKError } from "@/lib/errors";
import { IS_DEVELOPMENT } from "@/lib/constants";

import type { ReactNode } from "react";
import type { ClientToolkit } from "@/toolkits/types";
import type { z } from "zod";
import type { SelectedToolkit } from "@/components/toolkit/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { Workbench } from "@prisma/client";
import type { PersistedToolkit } from "@/lib/cookies/types";
import type { ImageModel } from "@/ai/image/types";
import type { LanguageModel } from "@/ai/language/types";
import type { FileUIPart } from "ai";
import type { ChatHelpers, ChatMessage } from "@/ai/types";

const DEFAULT_CHAT_MODEL = languageModels[0]!;

interface ChatContextType {
  // Chat state
  messages: Array<ChatMessage>;
  setMessages: ChatHelpers["setMessages"];
  input: string;
  setInput: (value: string | ((prev: string) => string)) => void;
  status: ChatHelpers["status"];
  streamStopped: boolean;
  files: Array<FileUIPart>;
  setFiles: (
    files: Array<FileUIPart> | ((prev: Array<FileUIPart>) => Array<FileUIPart>),
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
  handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  stop: () => void;
  reload: () => Promise<void>;
  sendMessage: ChatHelpers["sendMessage"];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  id: string;
  initialMessages: Array<ChatMessage>;
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

  const [files, setFiles] = useState<FileUIPart[]>([]);
  const [selectedChatModelState, setSelectedChatModelState] =
    useState<LanguageModel>(
      initialPreferences?.selectedChatModel ?? DEFAULT_CHAT_MODEL,
    );
  const [useNativeSearchState, setUseNativeSearchState] = useState<boolean>(
    initialPreferences?.useNativeSearch ??
      !!selectedChatModelState?.capabilities?.includes(
        LanguageModelCapability.WebSearch,
      ),
  );
  const [imageGenerationModelState, setImageGenerationModelState] = useState<
    ImageModel | undefined
  >(initialPreferences?.imageGenerationModel);
  const [toolkits, setToolkitsState] = useState<Array<SelectedToolkit>>(() => {
    // Restore toolkits by matching persisted ones with available client toolkits
    if (initialPreferences?.toolkits?.length) {
      return initialPreferences.toolkits
        .map((persistedToolkit) => {
          const clientToolkit =
            clientToolkits[persistedToolkit.id as keyof typeof clientToolkits];
          if (clientToolkit) {
            return {
              id: persistedToolkit.id as Toolkits,
              toolkit: clientToolkit,
              parameters: persistedToolkit.parameters as z.infer<
                ClientToolkit["parameters"]
              >,
            };
          }
          return null;
        })
        .filter((t): t is SelectedToolkit => t !== null);
    }
    return [];
  });
  const [hasInvalidated, setHasInvalidated] = useState(false);
  const [streamStopped, setStreamStopped] = useState(false);
  const [input, setInput] = useState("");

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

  const chat = useChat<ChatMessage>({
    id,
    experimental_throttle: 100,
    transport: new DefaultChatTransport<ChatMessage>({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest: ({ messages, trigger }) => {
        const last = messages.at(-1);
        return {
          body: {
            id,
            message: trigger === "submit-message" && last ? last : undefined,
            selectedChatModel: `${selectedChatModelState?.provider}/${selectedChatModelState?.modelId}`,
            imageGenerationModel: imageGenerationModelState
              ? `${imageGenerationModelState.provider}:${imageGenerationModelState.modelId}`
              : undefined,
            selectedVisibilityType: initialVisibilityType,
            useNativeSearch: useNativeSearchState,
            systemPrompt: workbench?.systemPrompt,
            toolkits: selectedChatModelState?.capabilities?.includes(
              LanguageModelCapability.ToolCalling,
            )
              ? toolkits.map((t) => ({ id: t.id, parameters: t.parameters }))
              : [],
            workbenchId: workbench?.id,
          },
        };
      },
    }),
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
  });

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate: reload,
    resumeStream,
  } = chat;

  const onStreamError = useCallback(() => {
    // Mark stream as stopped to hide thinking message
    setStreamStopped(true);
    // Also call stop to change the status away from 'submitted'
    void stop();
  }, [stop]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
    onStreamError,
  });

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault?.();
    // Reset stream stopped flag when submitting new message
    setStreamStopped(false);
    void sendMessage({ text: input, files });
    setFiles([]);
    setInput("");
  };

  useEffect(() => {
    if (
      selectedChatModelState?.capabilities?.includes(
        LanguageModelCapability.WebSearch,
      )
    ) {
      setUseNativeSearch(true);
    } else {
      setUseNativeSearch(false);
    }
  }, [selectedChatModelState]);

  const value = {
    messages,
    setMessages,
    input,
    setInput,
    status,
    streamStopped,
    files,
    setFiles,
    selectedChatModel: selectedChatModelState,
    setSelectedChatModel,
    useNativeSearch: useNativeSearchState,
    setUseNativeSearch,
    handleSubmit,
    stop: () => void stop(),
    reload,
    sendMessage,
    imageGenerationModel: imageGenerationModelState,
    setImageGenerationModel,
    toolkits,
    addToolkit,
    removeToolkit,
    workbench,
  } satisfies ChatContextType;

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
