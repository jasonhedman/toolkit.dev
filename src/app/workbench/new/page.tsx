"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VStack, HStack } from "@/components/ui/stack";
import { ToolkitList } from "@/components/toolkit/toolkit-list";
import type { SelectedToolkit } from "@/components/toolkit/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Anvil, Plus } from "lucide-react";
import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { clientToolkits } from "@/toolkits/toolkits/client";

export default function NewWorkbenchPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [selectedToolkits, setSelectedToolkits] = useState<SelectedToolkit[]>(
    [],
  );

  const createMutation = api.workbenches.createWorkbench.useMutation({
    onSuccess: (workbench) => {
      toast.success("Workbench created successfully");
      router.push(`/workbench/${workbench.id}`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a workbench name");
      return;
    }

    // Convert selectedToolkits to toolkitConfigs format
    const toolkitConfigs = selectedToolkits.map((toolkit) => ({
      id: toolkit.id,
      parameters: toolkit.parameters,
    }));

    createMutation.mutate({
      name: name.trim(),
      systemPrompt: systemPrompt.trim(),
      toolkitConfigs,
      visibility,
    });
  };

  const handleAddToolkit = (toolkit: SelectedToolkit) => {
    setSelectedToolkits([...selectedToolkits, toolkit]);
  };

  const handleRemoveToolkit = (id: Toolkits) => {
    setSelectedToolkits(
      selectedToolkits.filter((toolkit) => toolkit.id !== id),
    );
  };

  const handleUpdateToolkitParameters = (id: Toolkits, parameters: Record<string, unknown>) => {
    setSelectedToolkits(toolkits =>
      toolkits.map(toolkit =>
        toolkit.id === id ? { ...toolkit, parameters } : toolkit
      )
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-2 py-8">
      <VStack className="w-full items-start gap-8">
        <div className="flex items-center gap-2 md:flex-col md:items-start">
          <Anvil className="text-primary size-16" />
          <VStack className="gap-2">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                Create New Workbench
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Create a custom AI workbench with specific toolkits and system
                prompts.
              </p>
            </div>
          </VStack>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <VStack className="w-full items-start gap-6">
            {/* Name Field */}
            <VStack className="w-full items-start gap-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Workbench Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workbench name..."
                required
                maxLength={100}
              />
              <p className="text-muted-foreground text-xs">
                Give your workbench a descriptive name (1-100 characters).
              </p>
            </VStack>

            {/* Visibility Field */}
            <VStack className="w-full items-start gap-2">
              <Label htmlFor="visibility" className="text-base font-semibold">
                Visibility
              </Label>
              <Select value={visibility} onValueChange={(value: 'public' | 'private') => setVisibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Private workbenches are only visible to you. Public workbenches can be viewed by others.
              </p>
            </VStack>

            {/* System Prompt Field */}
            <VStack className="w-full items-start gap-2">
              <Label htmlFor="systemPrompt" className="text-base font-semibold">
                System Prompt
              </Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter system prompt to define the AI's behavior and role..."
                rows={8}
                className="resize-none"
                maxLength={10000}
              />
              <p className="text-muted-foreground text-xs">
                This prompt will instruct the AI on how to behave in this
                workbench (max 10,000 characters).
              </p>
            </VStack>

            {/* Toolkit Selection */}
            <VStack className="w-full items-start gap-2">
              <Label className="text-base font-semibold">
                Selected Toolkits ({selectedToolkits.length})
              </Label>
              <div className="flex w-full flex-wrap gap-2">
                {selectedToolkits.map((toolkit) => (
                  <div
                    key={toolkit.id}
                    className="flex items-center gap-1 rounded-md border bg-secondary/50 px-2 py-1 text-xs"
                  >
                    <ToolkitIcons
                      toolkits={[toolkit.id]}
                      iconClassName="size-3"
                      iconContainerClassName="p-0"
                    />
                    <span>{toolkit.toolkit.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 size-4 rounded-full p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveToolkit(toolkit.id)}
                      tabIndex={-1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {selectedToolkits.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No toolkits selected
                  </p>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="size-4" />
                    Add Toolkits
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] max-w-lg gap-2 overflow-hidden">
                  <DialogHeader className="gap-1">
                    <DialogTitle>Select Toolkits</DialogTitle>
                    <DialogDescription>
                      Choose the toolkits that will be available in this
                      workbench. You can configure parameters for each toolkit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto">
                    <ToolkitList
                      selectedToolkits={selectedToolkits}
                      onAddToolkit={handleAddToolkit}
                      onRemoveToolkit={handleRemoveToolkit}
                      onUpdateParameters={handleUpdateToolkitParameters}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <p className="text-muted-foreground text-xs">
                Select the toolkits that will be available in this workbench.
                You can configure parameters for each toolkit after adding them.
              </p>
            </VStack>
          </VStack>

          {/* Form Actions */}
          <div className="flex w-full gap-2">
            <Link href="/" className="flex-1">
              <Button
                type="button"
                variant="outline"
                disabled={createMutation.isPending}
                className="w-full"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="flex-1"
            >
              {createMutation.isPending ? "Creating..." : "Create Workbench"}
            </Button>
          </div>
        </form>
      </VStack>
    </div>
  );
}
