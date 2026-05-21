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

const getMessageText = (message: Message) => {
  const textFromParts = message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (textFromParts) return textFromParts;

  return message.content?.trim() ?? "";
};

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
                const textToCopy = getMessageText(message);

                if (!textToCopy) {
                  toast.error("There's no text to copy!");
                  return;
                }

                const didCopy = await copyToClipboard(textToCopy);
                if (!didCopy) {
                  toast.error("Failed to copy message to clipboard.");
                  return;
                }

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

export const MessageActions = PureMessageActions;
