import { useState, useEffect } from "react";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { AppUIMessage } from "@/app/(general)/_types/chat";

export function useMessages({
  chatId,
  status,
  scrollToBottom,
}: {
  chatId: string;
  status: UseChatHelpers<AppUIMessage>["status"];
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
