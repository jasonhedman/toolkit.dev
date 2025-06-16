import { notFound } from "next/navigation";

import { Chat } from "@/app/_components/chat/chat";
import { api } from "@/trpc/server";

import type { Message } from "@prisma/client";
import type { Attachment, UIMessage } from "ai";
import { languageModels } from "@/ai/models";
import { auth } from "@/server/auth";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const session = await auth();

  const chat = await api.chats.getChat(id);

  if (!chat) {
    notFound();
  }

  const messagesFromDb = await api.messages.getMessagesForChat({
    chatId: id,
  });

  function convertToUIMessages(messages: Array<Message>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: "",
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as unknown as Array<Attachment>) ?? [],
      annotations: message.modelId
        ? [
            {
              type: "model",
              model: (() => {
                const model = languageModels.find(
                  (model) => model.modelId === message.modelId.split(":")[1],
                );

                if (!model) {
                  return null;
                }

                return {
                  name: model.name,
                  provider: model.provider,
                  modelId: model.modelId,
                };
              })(),
            },
          ]
        : undefined,
    }));
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        initialVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
        autoResume={true}
        hasInitialMessages={messagesFromDb.length > 0}
      />
    </>
  );
}
