"use client";

import { useState } from "react";
import { SiStrava } from "@icons-pack/react-simple-icons";
import { api } from "@/trpc/react";
import {
  AuthButton,
  AuthRequiredDialog,
} from "@/toolkits/lib/auth-required-dialog";
import { Toolkits } from "../shared";
import type { ClientToolkitWrapper } from "@/toolkits/types";

export const StravaWrapper: ClientToolkitWrapper = ({ Item }) => {
  const { data: hasAccount, isLoading } =
    api.accounts.hasProviderAccount.useQuery("strava");

  const [isAuthRequiredDialogOpen, setIsAuthRequiredDialogOpen] =
    useState(false);

  if (isLoading) {
    return <Item isLoading={true} />;
  }

  if (!hasAccount) {
    return (
      <>
        <Item
          isLoading={false}
          onSelect={() => setIsAuthRequiredDialogOpen(true)}
        />
        <AuthRequiredDialog
          isOpen={isAuthRequiredDialogOpen}
          onOpenChange={setIsAuthRequiredDialogOpen}
          Icon={SiStrava}
          title="Connect your Strava account"
          description="This will request access to your activities and performance data."
          content={
            <AuthButton
              onClick={() => {
                const redirectUrl = `${window.location.href}?${Toolkits.Strava}=true`;
                const state = `redirect=${encodeURIComponent(redirectUrl)}`;
                const stravaAuthUrl = new URL("https://www.strava.com/oauth/authorize");
                stravaAuthUrl.searchParams.set("client_id", "170027");
                stravaAuthUrl.searchParams.set("response_type", "code");
                stravaAuthUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/auth/strava`);
                stravaAuthUrl.searchParams.set("scope", "read,activity:read_all");
                stravaAuthUrl.searchParams.set("state", state);
                
                window.location.href = stravaAuthUrl.toString();
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