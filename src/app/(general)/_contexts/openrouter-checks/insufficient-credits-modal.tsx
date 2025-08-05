"use client";

import React from "react";

import Link from "next/link";

import { ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";

export const InsufficientCreditsModal = () => {
  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <AnimatedLogo />
          <DialogTitle>Add Credits to your OpenRouter Account</DialogTitle>
          <DialogDescription className="text-center">
            You can add as much as you think you will use. $1 should be more
            than enough to get started.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <Link
          href={`https://openrouter.ai/settings/credits`}
          className="w-full"
          target="_blank"
        >
          <Button className="user-message w-full">
            Add Credits <ExternalLink className="size-4" />
          </Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
};
