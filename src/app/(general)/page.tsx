import { Chat } from "./_components/chat";
import LandingPage from "./_components/landing-page";

import { auth } from "@/server/auth";

import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <LandingPage />;
  }

  const id = generateUUID();

  return (
    <Chat
      key={id}
      id={id}
      initialVisibilityType="private"
      isReadonly={false}
      isNew={true}
    />
  );
}
