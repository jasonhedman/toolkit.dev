import { redirect } from "next/navigation";

import { Chat } from "@/app/(general)/_components/chat";
import { auth } from "@/server/auth";
import { generateUUID } from "@/lib/utils";

interface NewChatPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function NewChatPage(props: NewChatPageProps) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;

  const session = await auth();

  if (!session) {
    const redirectUrl = q
      ? `/login?redirect=${encodeURIComponent(`/new?q=${encodeURIComponent(q)}`)}`
      : "/login?redirect=/new";
    redirect(redirectUrl);
  }

  const id = generateUUID();

  return (
    <Chat
      key={id}
      id={id}
      initialVisibilityType="private"
      isReadonly={false}
      isNew={true}
      prefillQuery={q}
      autoSubmitQuery={q ? true : false}
    />
  );
}
