import { db } from "@/server/db";
import { ChatProvider } from "@/app/(general)/_contexts/chat-context";
import type { Message, Workbench } from "@prisma/client";
import { ChatLayout } from "./layout";
import { languageModels } from "@/ai/language";
import { ChatContent } from "./chat";
import { serverCookieUtils } from "@/lib/cookies/server";
import { clientToolkits } from "@/toolkits/toolkits/client";
import type { ClientToolkit } from "@/toolkits/types";
import type { z } from "zod";
import type { PersistedToolkit } from "@/lib/cookies/types";
import {
  attachmentToFilePart,
  type AppUIMessage,
  type ChatAttachment,
} from "@/app/(general)/_types/chat";

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
  ): Array<AppUIMessage> => {
    return messages.map((message) => {
      const parts = (message.parts as AppUIMessage["parts"]) ?? [];
      const hasFileParts = parts.some((part) => part.type === "file");
      const attachments = (
        (message.attachments as unknown as Array<ChatAttachment>) ?? []
      )
        .filter((attachment) => attachment.url)
        .map(attachmentToFilePart);

      return {
        id: message.id,
        parts: [...parts, ...(hasFileParts ? [] : attachments)],
        role: message.role as AppUIMessage["role"],
        createdAt: message.createdAt,
        metadata: message.modelId
          ? {
              model: (() => {
                const [provider, modelId] = message.modelId.split("/");
                const model = languageModels.find(
                  (model) =>
                    model.provider === provider && model.modelId === modelId,
                );

                // If model not in our list, create a display version
                return (
                  model ?? {
                    name: `${provider}/${modelId}`,
                    provider: provider ?? "unknown",
                    modelId: modelId ?? "unknown",
                  }
                );
              })(),
            }
          : undefined,
      };
    });
  };

  return (
    <ChatLayout>
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
    </ChatLayout>
  );
};
