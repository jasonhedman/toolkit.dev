import { Chat } from "./_components/chat";
import LandingPage from "./_components/landing-page";

import { auth } from "@/server/auth";

import { generateUUID } from "@/lib/utils";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

const getSearchParam = (
  searchParams: SearchParams | undefined,
  key: string,
) => {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
};

export default async function Page(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const query = getSearchParam(searchParams, "q")?.trim();
  const session = await auth();

  if (!session) {
    if (query) {
      const redirectPath = `/?${new URLSearchParams({ q: query })}`;
      redirect(`/login?${new URLSearchParams({ redirect: redirectPath })}`);
    }

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
      initialInput={query}
      autoSubmit={!!query}
    />
  );
}
