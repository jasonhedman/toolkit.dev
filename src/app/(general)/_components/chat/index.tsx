import { db } from "@/server/db";

import { ChatLayout } from "./layout";
import { ChatContent } from "./chat";

import { ChatProvider } from "@/app/(general)/_contexts/chat-context";
import { DataStreamProvider } from "@/app/(general)/_contexts/data-stream-provider";

import { serverCookieUtils } from "@/lib/cookies/server";

import { clientToolkits } from "@/toolkits/toolkits/client";

import type { ChatMessage } from "@/ai/types";
import type { ClientToolkit } from "@/toolkits/types";
import type { z } from "zod";
import type { PersistedToolkit } from "@/lib/cookies/types";
import type { Message, Workbench } from "@prisma/client";

interface Props {
  id: string;
  initialVisibilityType: "public" | "private";
  isReadonly: boolean;
  isNew: boolean;
  workbench?: Workbench;
}

export const Chat = async ({
  id,
  initialVisibilityType,
  isReadonly,
  isNew,
  workbench,
}: Props) => {
  const initialMessages = isNew
    ? []
    : await db.message.findMany({
        where: {
          chatId: id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

  // Fetch user preferences from server-side cookies
  const serverPreferences = await serverCookieUtils.getPreferences();

  // Convert server preferences to the format expected by ChatProvider
  const initialPreferences = {
    selectedChatModel: serverPreferences.selectedChatModel,
    imageGenerationModel: serverPreferences.imageGenerationModel,
    useNativeSearch: serverPreferences.useNativeSearch,
    toolkits: serverPreferences.toolkits
      ?.map((persistedToolkit: PersistedToolkit) => {
        const clientToolkit =
          clientToolkits[persistedToolkit.id as keyof typeof clientToolkits];
        if (clientToolkit) {
          return {
            id: persistedToolkit.id,
            parameters: persistedToolkit.parameters,
          };
        }
        return null;
      })
      .filter(
        (
          toolkit,
        ): toolkit is {
          id: string;
          toolkit: ClientToolkit;
          parameters: z.infer<ClientToolkit["parameters"]>;
        } => toolkit !== null,
      ),
  };

  const convertToUIMessages = (
    messages: Array<Message>,
  ): Array<ChatMessage> => {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as ChatMessage["parts"],
      role: message.role as ChatMessage["role"],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: "",
      createdAt: message.createdAt,
      metadata: {
        model: message.modelId,
      },
    }));
  };

  return (
    <ChatLayout>
      <DataStreamProvider>
        <ChatProvider
          id={id}
          initialMessages={convertToUIMessages(initialMessages)}
          initialVisibilityType={initialVisibilityType}
          autoResume={!isNew}
          workbench={workbench}
          initialPreferences={initialPreferences}
        >
          <ChatContent
            id={id}
            isReadonly={isReadonly}
            hasInitialMessages={initialMessages.length > 0}
          />
        </ChatProvider>
      </DataStreamProvider>
    </ChatLayout>
  );
};
