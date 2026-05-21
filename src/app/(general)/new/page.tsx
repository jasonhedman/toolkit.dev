import { redirect } from "next/navigation";

import { Chat } from "@/app/(general)/_components/chat";
import { auth } from "@/server/auth";
import { generateUUID } from "@/lib/utils";

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
  const redirectPath = query
    ? `/new?${new URLSearchParams({ q: query })}`
    : "/new";

  if (!session) {
    redirect(`/login?${new URLSearchParams({ redirect: redirectPath })}`);
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
