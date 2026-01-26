"use client";

import { useState } from "react";

import { SiSlack } from "@icons-pack/react-simple-icons";

import { signIn } from "next-auth/react";

import { api } from "@/trpc/react";

import {
    AuthButton,
    AuthRequiredDialog,
} from "@/toolkits/lib/auth-required-dialog";

import type { ClientToolkitWrapper } from "@/toolkits/types";
import { Toolkits } from "../shared";

const scopes = [
    "channels:read",
    "channels:write",
    "chat:write",
    "search:read",
    "users:read",
    "team:read",
];

export const SlackWrapper: ClientToolkitWrapper = ({ Item }) => {
    const { data: account, isLoading } =
        api.accounts.getAccountByProvider.useQuery("slack");

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
                    Icon={SiSlack}
                    title="Connect your Slack account"
                    description={
                        account
                            ? "You need to provide additional permissions to access the Slack Toolkit."
                            : "This will request access to read channels, send messages, and search your Slack workspace."
                    }
                    content={
                        <AuthButton
                            onClick={() => {
                                void signIn(
                                    "slack",
                                    {
                                        callbackUrl: `${window.location.href}?${Toolkits.Slack}=true`,
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
