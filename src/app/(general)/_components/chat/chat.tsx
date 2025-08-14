"use client";

import { motion, AnimatePresence } from "motion/react";
import { MultimodalInput } from "./input";
import { Messages } from "./messages";
import { StarterPrompts } from "./starter-prompts";

import { useScrollToBottom } from "@/app/(general)/_hooks/use-scroll-to-bottom";
import { useChatContext } from "@/app/(general)/_contexts/chat-context";

import { Logo } from "@/components/ui/logo";
import { useSearchParams } from "next/navigation";
import { WelcomeDialog } from "../welcome-dialog";
import { Anvil } from "lucide-react";
import { cn } from "@/lib/utils";

export const ChatContent = ({
  id,
  isReadonly,
  hasInitialMessages,
}: {
  id: string;
  isReadonly: boolean;
  hasInitialMessages: boolean;
}) => {
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "true";

  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const { messages, workbench } = useChatContext();
  const hasMessages = messages.length > 0;

  return (
    <>
      <div className="bg-background relative flex h-full min-w-0 flex-col">
        {/* Messages - flex-1 to take available space */}
        <Messages
          chatId={id}
          isReadonly={isReadonly}
          containerRef={containerRef}
          endRef={endRef}
          onViewportEnter={onViewportEnter}
          onViewportLeave={onViewportLeave}
          scrollToBottom={scrollToBottom}
        />

        {/* Input Container - normal flow no absolute positioning */}
        <motion.div
          initial={hasInitialMessages ? { y: 0 } : { y: "calc(-50vh + 50%)" }}
          animate={
            hasMessages || hasInitialMessages
              ? { y: 0 }
              : { y: "calc(-50vh + 50%)" }
          }
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.4,
          }}
          className={cn(
            "w-full px-4 pb-4",

            !hasMessages &&
              !hasInitialMessages &&
              "absolute bottom-4 left-1/2 max-w-3xl -translate-x-1/2",
            (hasMessages || hasInitialMessages) && "mx-auto max-w-3xl",
          )}
        >
          {/* Greeting - only shown when no messages */}
          <AnimatePresence>
            {!hasMessages && !hasInitialMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  enter: { delay: 0.1, duration: 0.3 },
                  exit: { delay: 0, duration: 0.05 },
                }}
                className="mb-4 flex flex-col items-center gap-2 pt-2 text-center md:mb-8 md:gap-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex items-center justify-center"
                >
                  {workbench ? (
                    <Anvil className="text-primary size-24" />
                  ) : (
                    <Logo className="size-12 md:size-24" />
                  )}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-xl font-bold md:text-3xl"
                >
                  {workbench
                    ? `${workbench.name} Workbench`
                    : "Welcome to Toolkit.dev"}
                </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              isAtBottom={isAtBottom}
              scrollToBottom={scrollToBottom}
            />
          )}

          {/* Starter Prompts - only shown when no messages */}
          <AnimatePresence>
            {!hasMessages && !hasInitialMessages && (
              <motion.div
                initial={{ opacity: 0, height: "auto" }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: "auto",
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  enter: { delay: 0.4, duration: 0.3 },
                  exit: { delay: 0, duration: 0.1 },
                }}
                className="mt-2 overflow-hidden md:mt-4"
              >
                {!hasMessages && <StarterPrompts />}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {welcome && <WelcomeDialog />}
    </>
  );
};
