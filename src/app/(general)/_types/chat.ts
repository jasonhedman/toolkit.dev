import type { FileUIPart, UIDataTypes, UIMessage } from "ai";

import type { LanguageModel } from "@/ai/language/types";

export type ChatAttachment = {
  url: string;
  name: string;
  contentType: "image/png" | "image/jpg" | "image/jpeg" | "application/pdf";
};

export type ChatModelMetadata = Pick<
  LanguageModel,
  "name" | "provider" | "modelId"
>;

export type ChatMessageMetadata = {
  model?: ChatModelMetadata | null;
};

export type ChatDataTypes = UIDataTypes & {
  error: {
    message: string;
  };
};

export type AppUIMessage = UIMessage<ChatMessageMetadata, ChatDataTypes> & {
  createdAt?: Date;
};

export function attachmentToFilePart(attachment: ChatAttachment): FileUIPart {
  return {
    type: "file",
    mediaType: attachment.contentType,
    filename: attachment.name,
    url: attachment.url,
  };
}

export function filePartToAttachment(part: FileUIPart): ChatAttachment {
  return {
    url: part.url,
    name: part.filename ?? "attachment",
    contentType: part.mediaType as ChatAttachment["contentType"],
  };
}

export function getMessageText(message: Pick<AppUIMessage, "parts">): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function getMessageAttachments(
  message: Pick<AppUIMessage, "parts">,
): ChatAttachment[] {
  return message.parts
    .filter((part): part is FileUIPart => part.type === "file")
    .map(filePartToAttachment);
}
