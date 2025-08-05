import { notFound, redirect } from "next/navigation";

import { Chat } from "@/app/(general)/_components/chat";
import { api } from "@/trpc/server";

import { auth } from "@/server/auth";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const session = await auth();

  if (!session) {
    redirect(`/login?redirect=/${id}`);
  }

  const chat = await api.chats.getChat(id);

  if (!chat) {
    notFound();
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
        isNew={false}
      />
    </>
  );
}
