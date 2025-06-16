"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useChat } from "@ai-sdk/react";

import { toast } from "sonner";

import { api } from "@/trpc/react";

import { generateUUID } from "@/lib/utils";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import { ChatSDKError } from "@/lib/errors";
import { localStorageUtils } from "@/lib/local-storage";

import { useAutoResume } from "@/app/_hooks/use-auto-resume";

import type { ReactNode } from "react";
import type { Attachment, UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
  LanguageModelCapability,
  type ImageModel,
  type LanguageModel,
} from "@/ai/types";
import type { ClientToolkit } from "@/toolkits/types";
import type { z } from "zod";
import { clientToolkits } from "@/toolkits/toolkits/client";
import type { SelectedToolkit } from "@/components/toolkit/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { Workbench } from "@prisma/client";
import { openAiLanguageModels } from "@/ai/models/openai";

const DEFAULT_CHAT_MODEL = openAiLanguageModels.find(
  (model) => model.modelId === "gpt-4.1",
)!;

interface ChatContextType {
  // Chat state
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  input: string;
  setInput: UseChatHelpers["setInput"];
  status: UseChatHelpers["status"];
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
}

export function ChatProvider({
  children,
  id,
  initialMessages,
  initialVisibilityType,
  autoResume,
  workbench,
}: ChatProviderProps) {
  const utils = api.useUtils();

  const [selectedChatModel, setSelectedChatModelState] =
    useState<LanguageModel>();
  const [useNativeSearch, setUseNativeSearchState] = useState(false);
  const [imageGenerationModel, setImageGenerationModelState] = useState<
    ImageModel | undefined
  >(undefined);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [toolkits, setToolkitsState] = useState<Array<SelectedToolkit>>([]);
  const [hasInvalidated, setHasInvalidated] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const preferences = localStorageUtils.getPreferences();

    if (preferences.selectedChatModel) {
      setSelectedChatModelState(preferences.selectedChatModel);
    } else {
      setSelectedChatModelState(DEFAULT_CHAT_MODEL);
    }

    if (preferences.imageGenerationModel) {
      setImageGenerationModelState(preferences.imageGenerationModel);
    }

    if (typeof preferences.useNativeSearch === "boolean") {
      setUseNativeSearchState(preferences.useNativeSearch);
    }

    // If this is a workbench chat, initialize with workbench toolkits
    if (workbench) {
      const workbenchToolkits = workbench.toolkitIds
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

      setToolkitsState(workbenchToolkits);
      return;
    }

    // Restore toolkits by matching persisted ones with available client toolkits
    if (preferences.toolkits && preferences.toolkits.length > 0) {
      const restoredToolkits = preferences.toolkits
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

      setToolkitsState(restoredToolkits);
    }
  }, [workbench]);

  // Wrapper functions that also save to localStorage
  const setSelectedChatModel = (model: LanguageModel) => {
    setSelectedChatModelState(model);
    localStorageUtils.setSelectedChatModel(model);
  };

  const setUseNativeSearch = (enabled: boolean) => {
    setUseNativeSearchState(enabled);
    localStorageUtils.setUseNativeSearch(enabled);
  };

  const setImageGenerationModel = (model: ImageModel | undefined) => {
    setImageGenerationModelState(model);
    localStorageUtils.setImageGenerationModel(model);
  };

  const setToolkits = (newToolkits: Array<SelectedToolkit>) => {
    setToolkitsState(newToolkits);
    localStorageUtils.setToolkits(newToolkits);
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
    handleSubmit,
    input,
    setInput,
    append,
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
      selectedChatModel: `${selectedChatModel?.provider}:${selectedChatModel?.modelId}`,
      imageGenerationModel: imageGenerationModel
        ? `${imageGenerationModel.provider}:${imageGenerationModel.modelId}`
        : undefined,
      selectedVisibilityType: initialVisibilityType,
      useNativeSearch,
      systemPrompt: workbench?.systemPrompt,
      toolkits: toolkits.map((t) => ({
        id: t.id,
        parameters: t.parameters,
      })),
      workbenchId: workbench?.id,
    }),
    onFinish: () => {
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

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume,
    data,
    setMessages,
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

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
