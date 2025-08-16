"use client";

import { useEffect } from "react";

import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

type ChatHelpers = UseChatHelpers<UIMessage>;

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: UIMessage[];
  resumeStream: ChatHelpers["resumeStream"];
  // kept for future use; not currently used
  setMessages: ChatHelpers["setMessages"];
  onStreamError?: () => void;
}

export function useAutoResume({
  autoResume,
  initialMessages,
  resumeStream,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMessages,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onStreamError,
}: UseAutoResumeParams) {
  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === "user") {
      // Attempt to resume an ongoing streaming response for this chat
      void resumeStream();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
