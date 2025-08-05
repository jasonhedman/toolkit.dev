import React from "react";

import { Activity, Wrench } from "lucide-react";

import { HStack, VStack } from "@/components/ui/stack";

import { ToolkitIcon } from "@/components/toolkit/toolkit-icons";

import { clientToolkits } from "@/toolkits/toolkits/client";

import type { Toolkits } from "@/toolkits/toolkits/shared";

import { cn } from "@/lib/utils";

interface ToolkitCardProps {
  toolkit: Toolkits;
  count: number;
}

export const ToolkitCard: React.FC<ToolkitCardProps> = ({ toolkit, count }) => {
  const clientToolkit = clientToolkits[toolkit];

  return (
    <VStack
      className={cn(
        "w-full items-start justify-between p-2 md:p-4",
        "border-t",
        "md:odd:border-r",
        "lg:border-r lg:nth-[3n]:border-r-0 lg:nth-last-[3]:border-b-0",
      )}
    >
      <VStack className="w-full items-start gap-2">
        <HStack className="w-full justify-between">
          <HStack className="gap-4">
            <ToolkitIcon toolkit={toolkit} className="size-5 md:size-6" />
            <h3 className="text-lg font-bold">{clientToolkit.name}</h3>
          </HStack>
          <HStack className="gap-1">
            <Activity className="size-3" />
            <p>{count}</p>
          </HStack>
        </HStack>
        <p className="text-muted-foreground text-sm">
          {clientToolkit.description}
        </p>
      </VStack>
      <HStack className="text-muted-foreground w-full justify-between text-sm">
        <HStack className="gap-1">
          <Wrench className="size-3" />
          <p>{Object.keys(clientToolkit.tools).length} tools</p>
        </HStack>
      </HStack>
    </VStack>
  );
};
