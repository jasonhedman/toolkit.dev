import { auth } from "@/server/auth";

import { redirect } from "next/navigation";

import { api } from "@/trpc/server";

import { AccountHeader } from "./components/header";
import { AccountTabs } from "./components/tabs";

const AccountPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) => {
  const { tab } = await searchParams;

  const session = await auth();

  if (!session) {
    redirect("/login?redirect=/account");
  }

  const user = await api.users.getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-2 py-4 md:space-y-8 md:py-16">
      <AccountHeader user={user} />
      <AccountTabs defaultTab={tab} />
    </div>
  );
};

export default AccountPage;
