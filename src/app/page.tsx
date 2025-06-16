import { Chat } from "@/app/_components/chat/chat";

import { auth } from "@/server/auth";

import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <div>Landing Page</div>;
  }

  const id = generateUUID();

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      initialVisibilityType="private"
      isReadonly={false}
      autoResume={false}
      hasInitialMessages={false}
    />
  );
}
