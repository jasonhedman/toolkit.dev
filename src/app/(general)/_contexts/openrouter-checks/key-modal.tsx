"use client";

import React, { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import Link from "next/link";

import { useSearchParams } from "next/navigation";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/ui/stack";
import { AnimatedLogo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";

import { setEnvVar } from "@/actions/add-env-var";

export const KeyModal = () => {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateOpenRouterKey = async () => {
      const code = searchParams.get("code");
      if (!code) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        });

        const { key } = (await response.json()) as { key: string };

        if (!key) {
          throw new Error("Failed to set OpenRouter API key.");
        }

        const { success } = await setEnvVar([
          { key: "OPENROUTER_API_KEY", value: key },
        ]);

        if (!success) {
          toast.error("Failed to set OpenRouter API key.");
          return;
        }

        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState(
          {},
          "",
          url.pathname + url.search + url.hash,
        );
      } catch (error) {
        toast.error("Failed to set OpenRouter API key.");
        setIsLoading(false);
        console.error(error);
      }
    };

    if (!isLoading) {
      void updateOpenRouterKey();
    }
  }, [searchParams, isLoading]);

  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <AnimatedLogo />
          <DialogTitle>Welcome, Toolkit Developer!</DialogTitle>
          <DialogDescription>
            You will need to set an OpenRouter API key to use the chat.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <VStack>
          <Link
            href={`https://openrouter.ai/auth?callback_url=${
              typeof window !== "undefined" ? window.location.href : ""
            }`}
            className="w-full"
          >
            <Button className="user-message w-full" disabled={isLoading}>
              {isLoading
                ? "Updating OpenRouter Key"
                : "Create an OpenRouter Key"}
              {isLoading && <Loader2 className="size-4 animate-spin" />}
            </Button>
          </Link>
          <p className="text-muted-foreground text-center text-xs">or</p>
          <p className="text-center text-xs">
            Update the <code>OPENROUTER_API_KEY</code> environment variable in
            the <code>env.local</code> file with your OpenRouter key.
          </p>
        </VStack>
      </DialogContent>
    </Dialog>
  );
};
