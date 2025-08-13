"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useChat } from "@ai-sdk/react";

import { toast } from "sonner";

import { OpenRouterChecks } from "./openrouter-checks";

import { api } from "@/trpc/react";

import { useAutoResume } from "@/app/(general)/_hooks/use-auto-resume";

import { LanguageModelCapability } from "@/ai/language/types";

import { clientToolkits } from "@/toolkits/toolkits/client";

import { languageModels } from "@/ai/language";

import { clientCookieUtils } from "@/lib/cookies/client";
import { ChatSDKError } from "@/lib/errors";
import { IS_DEVELOPMENT } from "@/lib/constants";

import type { ReactNode } from "react";
import type { Message, UseChatHelpers } from "@ai-sdk/react";
import type { Attachment } from "../_components/chat/types";
import type { ClientToolkit } from "@/toolkits/types";
import type { z } from "zod";
import type { SelectedToolkit } from "@/components/toolkit/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { Workbench } from "@prisma/client";
import type { PersistedToolkit } from "@/lib/cookies/types";
import type { ImageModel } from "@/ai/image/types";
import type { LanguageModel } from "@/ai/language/types";

const DEFAULT_CHAT_MODEL = languageModels[0]!;

interface ChatContextType {
  // Chat state
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  input: string;
  setInput: (input: string) => void;
  status: "idle" | "submitted" | "streaming" | "error" | "ready";
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
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  stop: () => void;
  reload: () => void;
  append: (
    _message: Message | { role: string; content: string },
    _options?: unknown,
  ) => Promise<string | null | undefined>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  id: string;
  initialMessages: Array<Message>;
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
  const [hasInvalidated, setHasInvalidated] = useState(false);
  const [streamStopped, setStreamStopped] = useState(false);

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

  const [input, setInput] = useState("");

  const { messages, setMessages, status, stop } = useChat({
    id,
    api: "/api/chat",
    onFinish: () => {
      setStreamStopped(false);
      void utils.messages.getMessagesForChat.invalidate({ chatId: id });
      if (messages.length === 0 && !hasInvalidated) {
        setHasInvalidated(true);
        void utils.chats.getChats.invalidate({
          workbenchId: workbench?.id,
        });
      }
    },
    onError: (error: unknown) => {
      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      } else {
        console.error(error);
        toast.error("An error occurred while processing your request");
      }
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input.trim()) {
      setStreamStopped(false);
      // TODO: Implement proper message sending
      setInput("");
    }
  };

  const reload = () => {
    // TODO: Implement reload functionality
  };

  const append = async (
    _message: Message | { role: string; content: string },
    _options?: unknown,
  ) => {
    // TODO: Implement append functionality
    return null;
  };

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume: reload,
    data: [],
    setMessages,
    onStreamError: () => {
      setStreamStopped(true);
      stop();
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

  const value: ChatContextType = {
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
    append,
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
