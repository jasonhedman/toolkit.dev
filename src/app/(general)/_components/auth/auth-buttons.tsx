"use client";

import { Button } from "@/components/ui/button";
import { AuthProviderIcon } from "../../../_components/navbar/account-button/provider-icon";
import { signIn } from "next-auth/react";

interface AuthButtonsProps {
  providers: {
    name: string;
    id: string;
  }[];
  redirect?: string;
}

export const AuthButtons = ({ providers, redirect }: AuthButtonsProps) => {
  return (
    <div className="flex flex-col gap-2">
      {providers
        .filter((provider) => provider.id !== "spotify")
        .map((provider) =>
          provider.id !== "credentials" ? (
            <Button
              key={provider.id}
              variant="outline"
              className="w-full"
              onClick={() => signIn(provider.id, { redirectTo: redirect })}
            >
              <AuthProviderIcon provider={provider.name} />
              Sign in with {provider.name}
            </Button>
          ) : (
            <Button
              key={provider.id}
              variant="outline"
              className="w-full"
              onClick={() => signIn("guest", { redirectTo: redirect })}
            >
              Sign in as Guest
            </Button>
          ),
        )}
    </div>
  );
};
