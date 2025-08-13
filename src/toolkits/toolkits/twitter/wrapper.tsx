"use client";

import { useState } from "react";

import { SiX } from "@icons-pack/react-simple-icons";

import { signIn } from "next-auth/react";

import { api } from "@/trpc/react";

import {
  AuthButton,
  AuthRequiredDialog,
} from "@/toolkits/lib/auth-required-dialog";

import type { ClientToolkitWrapper } from "@/toolkits/types";
import { Toolkits } from "../shared";

// Twitter API v2 scopes needed for reading user profiles and tweets
const scopes = ["tweet.read", "users.read", "offline.access"];

export const TwitterWrapper: ClientToolkitWrapper = ({ Item }) => {
  const { data: account, isLoading } =
    api.accounts.getAccountByProvider.useQuery("twitter");

  const [isAuthRequiredDialogOpen, setIsAuthRequiredDialogOpen] =
    useState(false);

  if (isLoading) {
    return <Item isLoading={true} />;
  }

  if (!scopes.every((scope) => account?.scope?.includes(scope))) {
    return (
      <>
        <Item
          isLoading={false}
          onSelect={() => setIsAuthRequiredDialogOpen(true)}
        />
        <AuthRequiredDialog
          isOpen={isAuthRequiredDialogOpen}
          onOpenChange={setIsAuthRequiredDialogOpen}
          Icon={SiX}
          title="Connect your Twitter account"
          description={
            account
              ? "You need to provide additional permissions to access the Twitter Toolkit."
              : "This will request read access to Twitter profiles and tweets."
          }
          content={
            <AuthButton
              onClick={() => {
                void signIn(
                  "twitter",
                  {
                    callbackUrl: `${window.location.href}?${Toolkits.Twitter}=true`,
                  },
                  {
                    scope: scopes.join(" "),
                  },
                );
              }}
            >
              Connect
            </AuthButton>
          }
        />
      </>
    );
  }

  return <Item isLoading={false} />;
};
