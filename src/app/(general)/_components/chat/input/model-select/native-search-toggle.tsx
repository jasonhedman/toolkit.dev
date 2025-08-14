import { LanguageModelCapability } from "@/ai/language/types";
import { useChatContext } from "@/app/(general)/_contexts/chat-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export const NativeSearchToggle = () => {
  const { useNativeSearch, setUseNativeSearch, selectedChatModel } =
    useChatContext();

  if (
    !selectedChatModel?.capabilities?.includes(
      LanguageModelCapability.WebSearch,
    )
  ) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setUseNativeSearch(!useNativeSearch);
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className={cn(
            "size-fit cursor-pointer rounded-full bg-transparent p-1",
            useNativeSearch && "bg-primary/10 text-primary",
          )}
          data-native-search-toggle="true"
        >
          <Globe className="size-4" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {useNativeSearch ? (
          <p>Native search enabled</p>
        ) : (
          <p>Native search disabled</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
