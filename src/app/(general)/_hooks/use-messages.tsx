import { useState, useEffect } from "react";

import type { UseChatHelpers } from "@ai-sdk/react";

export function useMessages({
  chatId,
  status,
  scrollToBottom,
}: {
  chatId: string;
  status: "idle" | "submitted" | "streaming" | "error" | "ready";
  scrollToBottom: (behavior: ScrollBehavior) => void;
}) {
  const [hasSentMessage, setHasSentMessage] = useState(false);

  useEffect(() => {
    if (chatId) {
      scrollToBottom("instant");
      setHasSentMessage(false);
    }
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (status === "submitted") {
      setHasSentMessage(true);
    }
  }, [status]);

  return {
    hasSentMessage,
  };
}
