"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useDeleteMessagesAfterTimestamp } from "@/app/(general)/_hooks/use-delete-messages";
import { useChatContext } from "@/app/(general)/_contexts/chat-context";

import type { Dispatch, SetStateAction } from "react";
import type { Message } from "ai";

export type MessageEditorProps = {
  message: Message;
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  chatId: string;
};

export function MessageEditor({
  message,
  setMode,
  chatId,
}: MessageEditorProps) {
  const { setMessages, append } = useChatContext();
  const { mutate } = useDeleteMessagesAfterTimestamp();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [draftContent, setDraftContent] = useState<string>(() => {
    if (message.parts && message.parts.length > 0) {
      return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n")
        .trim();
    }

    return message.content || "";
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  const onSubmit = async () => {
    setIsSubmitting(true);

    const messageCreatedAt = message.createdAt;
    const messageTimestamp = messageCreatedAt
      ? messageCreatedAt.getTime()
      : Date.now();
    const deleteFromTimestamp = new Date(messageTimestamp);
    mutate({
      chatId: chatId,
      timestamp: deleteFromTimestamp,
    });

    setMessages((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        return messages.slice(0, index);
      }
      return messages;
    });

    setMode("view");

    await append({
      role: "user",
      content: draftContent,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Textarea
        data-testid="message-editor"
        ref={textareaRef}
        className="w-full resize-none overflow-hidden rounded-xl bg-transparent !text-base outline-none"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row justify-end gap-2">
        <Button
          variant="outline"
          className="h-fit px-3 py-2"
          onClick={() => {
            setMode("view");
          }}
        >
          Cancel
        </Button>
        <Button
          data-testid="message-editor-send-button"
          variant="default"
          className="h-fit px-3 py-2"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
