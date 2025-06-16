"use client";

import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/stack";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import { Settings, Anvil, GitFork, Copy } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();
  const { data: session } = useSession();
  const utils = api.useUtils();

  // Extract toolkit IDs from the new toolkitConfigs structure
  const toolkitConfigs = workbench.toolkitConfigs as ToolkitConfig[];
  const toolkitIds = Array.isArray(toolkitConfigs)
    ? toolkitConfigs.map((config) => config.id as Toolkits)
    : [];

  const isOwner = session?.user?.id === workbench.userId;
  const isPublic = workbench.visibility === "public";
  const canFork = isPublic && !isOwner;

  const forkMutation = api.workbenches.forkWorkbench.useMutation({
    onSuccess: (newWorkbench) => {
      toast.success("Workbench forked successfully!");
      void utils.workbenches.getWorkbenches.invalidate();
      router.push(`/workbench/${newWorkbench.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const duplicateMutation = api.workbenches.duplicateWorkbench.useMutation({
    onSuccess: (newWorkbench) => {
      toast.success("Workbench duplicated successfully!");
      void utils.workbenches.getWorkbenches.invalidate();
      router.push(`/workbench/${newWorkbench.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFork = () => {
    forkMutation.mutate(workbench.id);
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(workbench.id);
  };

  return (
    <HStack className="justify-between border-b p-4">
      <HStack>
        <Anvil className="size-5" />
        <h1 className="text-lg font-semibold">{workbench.name}</h1>
        <ToolkitIcons toolkits={toolkitIds} />
        {isPublic && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Public
          </span>
        )}
      </HStack>
      <HStack className="gap-2">
        {/* Fork/Duplicate Actions */}
        {canFork ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFork}
            disabled={forkMutation.isPending}
          >
            <GitFork className="size-4 mr-2" />
            {forkMutation.isPending ? "Forking..." : "Fork"}
          </Button>
        ) : isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Copy className="size-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
                <Copy className="size-4 mr-2" />
                {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/workbench/${workbench.id}/edit`} className="flex items-center">
                  <Settings className="size-4 mr-2" />
                  Edit Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {/* Settings - Only for owners */}
        {isOwner && (
          <Link href={`/workbench/${workbench.id}/edit`}>
            <Button variant="ghost" size="icon" className="size-fit p-1">
              <Settings className="size-4" />
            </Button>
          </Link>
        )}
      </HStack>
    </HStack>
  );
}
