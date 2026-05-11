"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { AppUIMessage } from "@/app/(general)/_types/chat";

type DataPart =
  | { type: "append-message"; message: string }
  | { type: "error"; message: string };

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: AppUIMessage[];
  resumeStream: UseChatHelpers<AppUIMessage>["resumeStream"];
  data?: DataPart[];
  setMessages: UseChatHelpers<AppUIMessage>["setMessages"];
  onStreamError?: () => void;
}

export function useAutoResume({
  autoResume,
  initialMessages,
  resumeStream,
  data,
  setMessages,
  onStreamError,
}: UseAutoResumeParams) {
  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === "user") {
      void resumeStream();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.length === 0) return;

    const dataPart = data[0]!;

    if (dataPart.type === "append-message") {
      const message = JSON.parse(dataPart.message) as AppUIMessage;
      setMessages([...initialMessages, message]);
    } else if (dataPart.type === "error") {
      toast.error(dataPart.message);
      onStreamError?.();
    }
  }, [data, initialMessages, setMessages, onStreamError]);
}
