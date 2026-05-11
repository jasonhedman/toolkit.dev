import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/stack";
import { getClientToolkit } from "@/toolkits/toolkits/client";
import type { Toolkits, ServerToolkitNames } from "@/toolkits/toolkits/shared";
import type { DeepPartial, DynamicToolUIPart, ToolUIPart } from "ai";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type z from "zod";
import { useChatContext } from "@/app/(general)/_contexts/chat-context";

interface Props {
  toolInvocation: ToolUIPart | DynamicToolUIPart;
}

type ToolResult<T extends z.ZodType> =
  | {
      isError: true;
      result: {
        error: string;
      };
    }
  | {
      isError: false;
      result: z.infer<T>;
    };

const MessageToolComponent: React.FC<Props> = ({ toolInvocation }) => {
  const argsDefined = toolInvocation.input !== undefined;
  const completeOnFirstMount =
    toolInvocation.state === "output-available" ||
    toolInvocation.state === "output-error";

  const toolName =
    toolInvocation.type === "dynamic-tool"
      ? toolInvocation.toolName
      : toolInvocation.type.slice("tool-".length);

  const [server, tool] = toolName.split("_");

  if (!server || !tool) {
    return (
      <pre className="w-full max-w-full whitespace-pre-wrap">
        {JSON.stringify(toolInvocation, null, 2)}
      </pre>
    );
  }

  const typedServer = server as Toolkits;

  const clientToolkit = getClientToolkit(typedServer);

  if (!clientToolkit) {
    return (
      <pre className="w-full max-w-full whitespace-pre-wrap">
        {JSON.stringify(toolInvocation, null, 2)}
      </pre>
    );
  }

  const typedTool = tool as ServerToolkitNames[typeof typedServer];
  const toolConfig = clientToolkit.tools[typedTool];

  return (
    <motion.div
      initial={{
        opacity: argsDefined ? 1 : 0,
        y: argsDefined ? 0 : 20,
        scale: argsDefined ? 1 : 0.95,
      }}
      animate={
        !argsDefined
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
            }
          : undefined
      }
      transition={{ duration: 0.4, ease: "easeInOut" }}
      layout={!argsDefined ? true : undefined}
    >
      <Card className="gap-0 overflow-hidden p-0">
        <HStack className="border-b p-2">
          <clientToolkit.icon className="size-4" />
          {completeOnFirstMount ? (
            <span className="text-lg font-medium">
              {clientToolkit.name} Toolkit
            </span>
          ) : (
            <AnimatedShinyText className="text-lg font-medium">
              {clientToolkit.name} Toolkit
            </AnimatedShinyText>
          )}
          <AnimatePresence>
            {(toolInvocation.state === "input-available" ||
              toolInvocation.state === "input-streaming") && (
              <motion.div
                initial={{
                  opacity: argsDefined ? 1 : 0,
                  scale: argsDefined ? 1 : 0.8,
                }}
                animate={{ opacity: 1, scale: argsDefined ? 1 : 1 }}
                // exit={{ opacity: 0, scale: argsDefined ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="size-4 animate-spin opacity-60" />
              </motion.div>
            )}
          </AnimatePresence>
        </HStack>
        <motion.div
          className="p-2"
          layout={!argsDefined ? true : undefined}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {toolInvocation.state === "input-available" ||
            toolInvocation.state === "input-streaming" ? (
              <motion.div
                key="call"
                initial={{
                  opacity: argsDefined ? 1 : 0,
                  height: argsDefined ? "auto" : 0,
                }}
                animate={{ opacity: 1, height: "auto" }}
                // exit={{ opacity: 0, height: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  height: { duration: 0.4, ease: "easeInOut" },
                }}
                style={{ overflow: "hidden" }}
              >
                {toolInvocation.input !== undefined && (
                  <toolConfig.CallComponent
                    args={
                      toolInvocation.input as DeepPartial<
                        z.infer<typeof toolConfig.inputSchema>
                      >
                    }
                    isPartial={toolInvocation.state === "input-streaming"}
                  />
                )}
              </motion.div>
            ) : toolConfig && completeOnFirstMount ? (
              (() => {
                const result =
                  toolInvocation.state === "output-error"
                    ? {
                        isError: true,
                        result: {
                          error: toolInvocation.errorText,
                        },
                      }
                    : (toolInvocation.output as ToolResult<
                        typeof toolConfig.outputSchema
                      >);

                if (result.isError) {
                  return (
                    <div className="w-full max-w-full whitespace-pre-wrap">
                      <p className="text-destructive">
                        Error: {result.result.error}
                      </p>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key="result"
                    initial={{
                      opacity: completeOnFirstMount ? 1 : 0,
                      height: completeOnFirstMount ? "auto" : 0,
                    }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                      height: { duration: 0.4, ease: "easeInOut" },
                    }}
                    style={{ overflow: "hidden" }}
                  >
                    <MessageToolResultComponent
                      Component={({ append }) => (
                        <toolConfig.ResultComponent
                          args={
                            toolInvocation.input as z.infer<
                              typeof toolConfig.inputSchema
                            >
                          }
                          result={result.result}
                          append={append}
                        />
                      )}
                    />
                  </motion.div>
                );
              })()
            ) : (
              <motion.div
                key="fallback"
                initial={{
                  opacity: completeOnFirstMount ? 1 : 0,
                  height: completeOnFirstMount ? "auto" : 0,
                }}
                animate={{ opacity: 1, height: "auto" }}
                // exit={{
                //   opacity: 0,
                //   height: completeOnFirstMount ? "auto" : 0,
                // }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  height: { duration: 0.4, ease: "easeInOut" },
                }}
                style={{ overflow: "hidden" }}
              >
                <pre className="w-full max-w-full whitespace-pre-wrap">
                  {JSON.stringify(toolInvocation, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Card>
    </motion.div>
  );
};

const areEqual = (prevProps: Props, nextProps: Props): boolean => {
  const { toolInvocation: prev } = prevProps;
  const { toolInvocation: next } = nextProps;

  // Compare all relevant fields of toolInvocation
  if (prev.toolCallId !== next.toolCallId) return false;
  if (prev.type !== next.type) return false;
  if (prev.state !== next.state) return false;

  // Deep compare args object
  if (JSON.stringify(prev.input) !== JSON.stringify(next.input)) return false;

  // Deep compare result object (only exists when state is "result")
  if (prev.state === "output-available" && next.state === "output-available") {
    // Both have result property, compare them
    if (JSON.stringify(prev.output) !== JSON.stringify(next.output))
      return false;
  } else if (
    prev.state === "output-available" ||
    next.state === "output-available"
  ) {
    // Only one has result property, they're different
    return false;
  }

  return true;
};

export const MessageTool = React.memo(MessageToolComponent, areEqual);

const MessageToolResultComponent: React.FC<{
  Component: React.ComponentType<{
    append: (message: { role: "user"; content: string }) => void;
  }>;
}> = ({ Component }) => {
  const { sendMessage } = useChatContext();
  const append = (message: { role: "user"; content: string }) => {
    void sendMessage({ text: message.content });
  };

  return <Component append={append} />;
};
