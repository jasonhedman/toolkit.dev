import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Info } from "lucide-react";
import { HStack, VStack } from "@/components/ui/stack";
import { clientToolkits } from "@/toolkits/toolkits/client";
import type { ClientToolkit } from "@/toolkits/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import { ClientToolkitConfigure } from "@/components/toolkit/toolkit-configure";
import type { SelectedToolkit } from "./types";
import { toolkitGroups } from "@/toolkits/toolkit-groups";

interface ToolkitListProps {
  selectedToolkits: SelectedToolkit[];
  onAddToolkit: (toolkit: SelectedToolkit) => void;
  onRemoveToolkit: (id: Toolkits) => void;
}

export const ToolkitList: React.FC<ToolkitListProps> = ({
  selectedToolkits,
  onAddToolkit,
  onRemoveToolkit,
}) => {
  return (
    <TooltipProvider>
      <VStack className="w-full items-start gap-4">
        {toolkitGroups.map((group) => {
          return (
            <VStack key={group.id} className="w-full items-start">
              <HStack className="gap-2">
                <group.icon className="size-4" />
                <h3 className="font-bold">{group.name}</h3>
              </HStack>
              <div className="bg-muted/50 w-full rounded-md border">
                {Object.entries(clientToolkits)
                  .filter(([, toolkit]) => toolkit.type === group.id)
                  .map(([id, toolkit]) => {
                    return (
                      <ToolkitItem
                        key={id}
                        id={id as Toolkits}
                        toolkit={toolkit as ClientToolkit}
                        selectedToolkits={selectedToolkits}
                        onAddToolkit={onAddToolkit}
                        onRemoveToolkit={onRemoveToolkit}
                      />
                    );
                  })}
              </div>
            </VStack>
          );
        })}
      </VStack>
    </TooltipProvider>
  );
};

interface ToolkitItemProps {
  id: Toolkits;
  toolkit: ClientToolkit;
  selectedToolkits: SelectedToolkit[];
  onAddToolkit: (toolkit: SelectedToolkit) => void;
  onRemoveToolkit: (id: Toolkits) => void;
}

const ToolkitItem = ({
  id,
  toolkit,
  selectedToolkits,
  onAddToolkit,
  onRemoveToolkit,
}: ToolkitItemProps) => {
  const isSelected = selectedToolkits.some((t) => t.id === id);
  const needsConfiguration = Object.keys(toolkit.parameters.shape).length > 0;

  const addToolkitButtons = isSelected ? (
    <Button
      variant="primaryOutline"
      size="sm"
      onClick={() => onRemoveToolkit(id)}
      className="bg-transparent"
      type="button"
    >
      Active
    </Button>
  ) : needsConfiguration ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          type="button"
        >
          Add
          <Plus className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <ClientToolkitConfigure
          toolkit={toolkit}
          id={id}
          schema={toolkit.parameters}
          onAdd={onAddToolkit}
        />
      </PopoverContent>
    </Popover>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onAddToolkit({ id, toolkit, parameters: {} })}
      className="bg-transparent"
      type="button"
    >
      Add
      <Plus className="size-4" />
    </Button>
  );

  return (
    <div key={id} className="border-border/50 border-b p-2 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col">
          <HStack>
            <toolkit.icon className="size-4" />
            <h3 className="text-sm font-medium">{toolkit.name}</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground size-3 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-64">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Available Tools</p>
                  <ul className="space-y-1">
                    {Object.entries(toolkit.tools).map(([name, tool]) => (
                      <li key={name} className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
                        <p className="text-xs">{tool.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </HStack>
          <p className="text-muted-foreground text-xs">{toolkit.description}</p>
        </div>

        <div className="flex w-28 justify-end gap-2">
          {toolkit.addToolkitWrapper ? (
            <toolkit.addToolkitWrapper>
              {addToolkitButtons}
            </toolkit.addToolkitWrapper>
          ) : (
            addToolkitButtons
          )}
        </div>
      </div>
    </div>
  );
};
