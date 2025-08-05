import { HStack } from "@/components/ui/stack";

import { ToolkitIcon } from "@/components/toolkit/toolkit-icons";

import { clientToolkits } from "@/toolkits/toolkits/client";

import type { WorkbenchExample } from "./types";

export const WorkbenchCard: React.FC<{
  workbench: WorkbenchExample;
}> = ({ workbench }) => {
  return (
    <div className="flex h-full flex-col gap-2 border-b p-2 transition-all duration-300 last:border-b-0 md:p-4 lg:border-r lg:last:border-b">
      <HStack className="items-center gap-3">
        <workbench.icon className="text-primary size-5" />
        <h3 className="text-lg font-bold">{workbench.title}</h3>
      </HStack>
      <p className="text-sm italic opacity-80">{workbench.systemPrompt}</p>
      <div className="flex flex-wrap gap-2">
        {workbench.toolkits.map((toolkit) => {
          const clientToolkit = clientToolkits[toolkit];
          return (
            <HStack key={toolkit} className="text-muted-foreground gap-1">
              <ToolkitIcon toolkit={toolkit} className="size-3" />
              <span className="text-xs">{clientToolkit.name}</span>
            </HStack>
          );
        })}
      </div>
    </div>
  );
};
