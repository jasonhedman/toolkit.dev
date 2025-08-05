import { memo } from "react";

import { toast } from "sonner";

import { useCopyToClipboard } from "usehooks-ts";

import { Copy, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

import type { Message } from "ai";
import { HStack } from "@/components/ui/stack";
import { ModelProviderIcon } from "@/components/ui/model-icon";

interface Props {
  message: Message;
  isLoading: boolean;
  chatId: string;
}

export const PureMessageActions: React.FC<Props> = ({
  message,
  isLoading,
  chatId,
}) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const router = useRouter();
  const utils = api.useUtils();
  const branchChatMutation = api.chats.branchChat.useMutation({
    onSuccess: (newChat) => {
      toast.success("Chat branched successfully!");
      void utils.chats.getChats.invalidate();
      router.push(`/${newChat.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to branch chat: ${error.message}`);
    },
  });

  // Extract modelId from message annotations
  const model = message.annotations?.find(
    (annotation) => (annotation as { type: string }).type === "model",
  ) as
    | { model: { name: string; provider: string; modelId: string } | null }
    | undefined;

  if (isLoading) return null;
  if (message.role === "user") return null;

  const handleBranch = () => {
    branchChatMutation.mutate({
      originalChatId: chatId,
      messageId: message.id,
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-muted-foreground size-fit p-1"
              variant="ghost"
              size="icon"
              onClick={async () => {
                const textFromParts = message.parts
                  ?.filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("\n")
                  .trim();

                if (!textFromParts) {
                  toast.error("There's no text to copy!");
                  return;
                }

                await copyToClipboard(textFromParts);
                toast.success("Copied to clipboard!");
              }}
            >
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-muted-foreground size-fit p-1"
              variant="ghost"
              size="icon"
              onClick={handleBranch}
              disabled={branchChatMutation.isPending}
            >
              <GitBranch />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Branch chat from here</TooltipContent>
        </Tooltip>
        {model?.model && (
          <HStack>
            <ModelProviderIcon provider={model.model.provider} />
            <p className="text-muted-foreground text-xs">{model.model.name}</p>
          </HStack>
        )}
      </div>
    </TooltipProvider>
  );
};

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
