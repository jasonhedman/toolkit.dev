"use client";

import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/stack";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import { Settings, Anvil } from "lucide-react";
import Link from "next/link";

interface ToolkitConfig {
  id: string;
  parameters?: Record<string, unknown>;
}

interface UpdatedWorkbench {
  id: string;
  name: string;
  systemPrompt: string;
  toolkitConfigs: unknown;
  visibility: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkbenchHeaderProps {
  workbench: UpdatedWorkbench;
}

export function WorkbenchHeader({ workbench }: WorkbenchHeaderProps) {
  // Extract toolkit IDs from the new toolkitConfigs structure
  const toolkitConfigs = workbench.toolkitConfigs as ToolkitConfig[];
  const toolkitIds = Array.isArray(toolkitConfigs)
    ? toolkitConfigs.map((config) => config.id as Toolkits)
    : [];

  return (
    <HStack className="justify-between border-b p-4">
      <HStack>
        <Anvil className="size-5" />
        <h1 className="text-lg font-semibold">{workbench.name}</h1>
        <ToolkitIcons toolkits={toolkitIds} />
      </HStack>
      <Link href={`/workbench/${workbench.id}/edit`}>
        <Button variant="ghost" size="icon" className="size-fit p-1">
          <Settings className="size-4" />
        </Button>
      </Link>
    </HStack>
  );
}
