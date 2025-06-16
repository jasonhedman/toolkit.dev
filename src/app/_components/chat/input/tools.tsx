import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, Save, Wrench } from "lucide-react";
import { useChatContext } from "@/app/_contexts/chat-context";
import { useState } from "react";
import { ToolkitList } from "@/components/toolkit/toolkit-list";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import type { Toolkits } from "@/toolkits/toolkits/shared";

interface ToolkitConfig {
  id: string;
  parameters?: Record<string, unknown>;
}

export const ToolsSelect = () => {
  const { toolkits, addToolkit, removeToolkit, workbench, updateToolkitParameters } = useChatContext();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { mutate: updateWorkbench, isPending } =
    api.workbenches.updateWorkbench.useMutation({
      onSuccess: () => {
        toast.success("Workbench updated successfully");
        router.refresh();
        setIsOpen(false);
      },
    });

  const handleSave = () => {
    if (workbench) {
      // Convert toolkits to toolkitConfigs format
      const toolkitConfigs = toolkits.map((toolkit) => ({
        id: toolkit.id,
        parameters: toolkit.parameters,
      }));

      // Safely get visibility with fallback
      const workbenchData = workbench as unknown as { visibility?: string };
      const visibility = (workbenchData.visibility as 'public' | 'private') ?? 'private';

      updateWorkbench({
        id: workbench.id,
        name: workbench.name,
        systemPrompt: workbench.systemPrompt,
        toolkitConfigs,
        visibility,
      });
    }
  };

  // Extract toolkit IDs for display
  const toolkitIds = toolkits.map((toolkit) => toolkit.id);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Wrench className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl gap-2">
          <DialogHeader>
            <DialogTitle>Configure Toolkits</DialogTitle>
            <DialogDescription>
              Add or remove toolkits and configure their parameters for this chat.
              {workbench && " Changes will be saved to your workbench."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <ToolkitList
              selectedToolkits={toolkits}
              onAddToolkit={addToolkit}
              onRemoveToolkit={removeToolkit}
              onUpdateParameters={updateToolkitParameters}
            />
          </div>
          {workbench && (
            <div className="flex justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <ToolkitIcons toolkits={toolkitIds} />
                <span className="text-sm text-muted-foreground">
                  {toolkits.length} toolkit{toolkits.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save to Workbench
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
