import { notFound } from "next/navigation";

import { auth } from "@/server/auth";
import { Chat } from "@/app/(general)/_components/chat";
import { api } from "@/trpc/server";

export default async function Page(props: {
  params: Promise<{ id: string; chatId: string }>;
}) {
  const params = await props.params;
  const { id, chatId } = params;

  const session = await auth();

  const [chat, workbench] = await Promise.all([
    api.chats.getChat(chatId),
    api.workbenches.getWorkbench(id),
  ]);

  if (!chat || !workbench) {
    notFound();
  }

  return (
    <Chat
      id={chat.id}
      initialVisibilityType={chat.visibility}
      isReadonly={session?.user?.id !== chat.userId}
      isNew={false}
      workbench={workbench}
    />
  );
}
