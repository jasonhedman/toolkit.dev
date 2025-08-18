import { Chat } from "./_components/chat";
import LandingPage from "./_components/landing-page";

import { auth } from "@/server/auth";

import { generateUUID } from "@/lib/utils";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function Page(props: HomePageProps) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;

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
      prefillQuery={q}
    />
  );
}
