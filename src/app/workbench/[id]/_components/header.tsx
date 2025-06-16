"use client";

import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/stack";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { Workbench } from "@prisma/client";
import { Settings, Anvil } from "lucide-react";
import Link from "next/link";

interface WorkbenchHeaderProps {
  workbench: Workbench;
}

export function WorkbenchHeader({ workbench }: WorkbenchHeaderProps) {
  return (
    <HStack className="justify-between border-b p-4">
      <HStack>
        <Anvil className="size-5" />
        <h1 className="text-lg font-semibold">{workbench.name}</h1>
        <ToolkitIcons toolkits={workbench.toolkitIds as Toolkits[]} />
      </HStack>
      <Link href={`/workbench/${workbench.id}/edit`}>
        <Button variant="ghost" size="icon" className="size-fit p-1">
          <Settings className="size-4" />
        </Button>
      </Link>
    </HStack>
  );
}
