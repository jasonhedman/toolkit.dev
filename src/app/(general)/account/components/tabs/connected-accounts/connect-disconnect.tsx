"use client";

import React from "react";

import { Check, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { api } from "@/trpc/react";
import { signIn } from "next-auth/react";

interface ConnectProps {
  provider: string;
}

export const ConnectButton: React.FC<ConnectProps> = ({ provider }) => {
  return (
    <Button
      onClick={() => {
        void signIn(provider, {
          callbackUrl: "/account?tab=connected-accounts",
        });
      }}
    >
      Connect
    </Button>
  );
};

interface DisconnectProps {
  accountId: string;
}

export const DisconnectButton: React.FC<DisconnectProps> = ({ accountId }) => {
  const router = useRouter();
  const utils = api.useUtils();
  const {
    mutate: deleteAccount,
    isPending,
    isSuccess,
  } = api.accounts.deleteAccount.useMutation({
    onSuccess: async () => {
      await utils.accounts.getAccounts.invalidate();
      router.refresh();
      toast.success("Account disconnected");
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => {
        void deleteAccount(accountId);
      }}
      disabled={isPending}
    >
      Disconnect
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : isSuccess ? (
        <Check />
      ) : null}
    </Button>
  );
};
