"use client";

import { memo, useState } from "react";

import { Pencil } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import equal from "fast-deep-equal";

import { Button } from "@/components/ui/button";
import { LLMMarkdown } from "./utils/llm-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "../preview-attachment";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";

import { cn, sanitizeText } from "@/lib/utils";

import type { UIMessage } from "ai";

import { MessageTool } from "./message-tool";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

type ToolInvocationV5 = {
  type: string;
  toolCallId: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
  args?: unknown;
  result?: unknown;
  toolName?: string;
};

interface Props {
  message: UIMessage;
  isLoading: boolean;
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  chatId: string;
}

const PurePreviewMessage: React.FC<Props> = ({
  message,
  isLoading,
  isReadonly,
  requiresScrollPadding,
  chatId,
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="group/message mx-auto w-full max-w-3xl px-4"
        initial={{
          y: message.parts?.length < 2 ? 5 : 0,
          opacity: message.parts?.length < 2 ? 0 : 1,
        }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          <div
            className={cn(
              "flex w-full max-w-full flex-col gap-4",
              requiresScrollPadding &&
                message.role === "assistant" &&
                "min-h-24 md:min-h-96",
              message.role === "assistant" && "w-0 flex-1",
            )}
          >
            {message.parts?.some(
              (p) => (p as { type: string }).type === "attachment",
            ) && (
              <div className="flex flex-col gap-2">
                {message.parts
                  ?.filter((p) => (p as { type: string }).type === "attachment")
                  .map((part, index) => {
                    const attachment = part as {
                      url?: string;
                      data?: string;
                      name?: string;
                      contentType?: string;
                      mediaType?: string;
                    };
                    const url = attachment.url ?? attachment.data;
                    const name = attachment.name ?? "attachment";
                    const contentType =
                      attachment.contentType ??
                      attachment.mediaType ??
                      "application/octet-stream";

                    return (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          {name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({contentType})
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning") {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={(part as any).text}
                  />
                );
              }

              if (
                (type as string) === "dynamic-tool" ||
                (type as string).startsWith("tool-")
              ) {
                return (
                  <MessageTool
                    key={key}
                    toolInvocation={part as ToolInvocationV5}
                  />
                );
              }

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row items-start gap-2">
                      {message.role === "user" && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="text-muted-foreground h-fit rounded-full px-2 opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <Pencil />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex w-full max-w-full flex-col gap-4", {
                          "user-message rounded-xl px-3 py-2 text-white":
                            message.role === "user",
                        })}
                      >
                        <LLMMarkdown
                          isStreamFinished={!isLoading}
                          llmOutput={sanitizeText(part.text)}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <MessageEditor
                    key={key}
                    message={message}
                    setMode={setMode}
                    chatId={chatId}
                  />
                );
              }

              return null;
            })}

            {message.role === "assistant" && (
              <MessageActions
                message={message}
                isLoading={isLoading}
                chatId={chatId}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    return equal(prevProps, nextProps);
  },
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="group/message mx-auto min-h-24 w-full max-w-3xl px-4 md:min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
      data-role={role}
    >
      <div
        className={cn(
          "flex w-full gap-4 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="flex w-full flex-col gap-2">
          <div className="text-muted-foreground mt-0.5 flex flex-col gap-4">
            <AnimatedShinyText className="w-fit font-medium">
              Thinking...
            </AnimatedShinyText>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
