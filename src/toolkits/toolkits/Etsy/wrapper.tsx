"use client";

import { useState } from "react";

import { SiEtsy } from "@icons-pack/react-simple-icons";

import { signIn } from "next-auth/react";

import { api } from "@/trpc/react";

import {
  AuthButton,
  AuthRequiredDialog,
} from "@/toolkits/lib/auth-required-dialog";

import type { ClientToolkitWrapper } from "@/toolkits/types";
import { Toolkits } from "../shared";

export const EtsyWrapper: ClientToolkitWrapper = ({ Item }) => {
  const { data: hasAccount, isLoading } =
    api.accounts.hasProviderAccount.useQuery("etsy");

  const { data: hasAccess, isLoading: isLoadingAccess } =
    api.features.hasFeature.useQuery({
      feature: "etsy",
    });

  const [isAuthRequiredDialogOpen, setIsAuthRequiredDialogOpen] =
    useState(false);

  if (isLoading || isLoadingAccess) {
    return <Item isLoading={true} />;
  }

  if (!hasAccount || !hasAccess) {
    return (
      <>
        <Item
          isLoading={false}
          onSelect={() => setIsAuthRequiredDialogOpen(true)}
        />
        <AuthRequiredDialog
          isOpen={isAuthRequiredDialogOpen}
          onOpenChange={setIsAuthRequiredDialogOpen}
          Icon={SiEtsy}
          title="Connect your Etsy account"
          description="This will allow the toolkit to access your Etsy data."
          content={
            <AuthButton
              onClick={() => {
                void signIn("etsy", {
                  callbackUrl: `${window.location.href}?${Toolkits.Etsy}=true`,
                });
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