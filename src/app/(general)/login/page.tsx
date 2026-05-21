import { providers } from "@/server/auth/providers";

import { LoginForm } from "./login-form";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

const getSearchParam = (
  searchParams: SearchParams | undefined,
  key: string,
) => {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
};

export default async function LoginPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const redirectTo = getSearchParam(searchParams, "redirect");
  const session = await auth();

  if (session) {
    redirect(redirectTo ?? "/");
  }

  const mappedProviders = providers.map((provider) => ({
    name: provider.name,
    id: provider.id,
  }));

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm providers={mappedProviders} />
      </div>
    </div>
  );
}
