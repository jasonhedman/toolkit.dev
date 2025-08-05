import { useEffect, useState } from "react";

import { Wrench } from "lucide-react";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { ToolkitSelect } from "@/components/toolkit/toolkit-select";

import { useChatContext } from "@/app/(general)/_contexts/chat-context";

import { clientToolkits } from "@/toolkits/toolkits/client";

import { cn } from "@/lib/utils";

import { LanguageModelCapability } from "@/ai/language/types";

export const ToolsSelect = () => {
  const { toolkits, addToolkit, removeToolkit, selectedChatModel, workbench } =
    useChatContext();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(
    Object.keys(clientToolkits).some((toolkit) => searchParams.get(toolkit)),
  );

  useEffect(() => {
    if (
      !isOpen &&
      Object.keys(clientToolkits).some((toolkit) => searchParams.get(toolkit))
    ) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    selectedChatModel &&
    !selectedChatModel.capabilities?.includes(
      LanguageModelCapability.ToolCalling,
    )
  ) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"outline"}
              className="w-fit cursor-not-allowed justify-start bg-transparent opacity-50 md:w-auto md:px-2"
            >
              <Wrench />
              <span className="hidden md:block">Add Toolkits</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This model does not support tool calling</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <ToolkitSelect
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toolkits={toolkits}
      addToolkit={addToolkit}
      removeToolkit={removeToolkit}
      workbench={workbench}
    >
      <Button
        variant={"outline"}
        className={cn(
          "w-fit justify-center bg-transparent md:w-auto md:px-2",
          toolkits.length === 0 && "size-9 md:w-auto",
        )}
        disabled={
          !selectedChatModel?.capabilities?.includes(
            LanguageModelCapability.ToolCalling,
          )
        }
      >
        {toolkits.length > 0 ? (
          <ToolkitIcons toolkits={toolkits.map((toolkit) => toolkit.id)} />
        ) : (
          <Wrench />
        )}
        <span className="hidden md:block">
          {toolkits.length > 0
            ? `${toolkits.length} Toolkit${toolkits.length > 1 ? "s" : ""}`
            : "Add Toolkits"}
        </span>
      </Button>
    </ToolkitSelect>
  );
};
