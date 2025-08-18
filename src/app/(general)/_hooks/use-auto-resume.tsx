import { useEffect } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/ai/types";
import { useDataStream } from "../_contexts/data-stream-provider";

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: ChatMessage[];
  resumeStream: UseChatHelpers<ChatMessage>["resumeStream"];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  onStreamError: () => void;
}

export function useAutoResume({
  autoResume,
  initialMessages,
  resumeStream,
  setMessages,
  onStreamError,
}: UseAutoResumeParams) {
  const { dataStream } = useDataStream();

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
    if (!dataStream) return;
    if (dataStream.length === 0) return;

    const dataPart = dataStream[0];

    if (dataPart?.type === "data-appendMessage") {
      const message = JSON.parse(dataPart.data as string) as ChatMessage;
      setMessages([...initialMessages, message]);
    }

    if (dataPart?.type === "data-error") {
      console.error(dataPart.data);
      onStreamError();
    }
  }, [dataStream, initialMessages, setMessages, onStreamError]);
}
