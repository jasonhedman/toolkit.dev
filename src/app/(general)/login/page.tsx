import { providers } from "@/server/auth/providers";

import { LoginForm } from "./login-form";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
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
