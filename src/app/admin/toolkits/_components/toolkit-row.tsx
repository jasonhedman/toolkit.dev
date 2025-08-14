import { TableCell, TableRow } from "@/components/ui/table";

import { api } from "@/trpc/server";

import type { ClientToolkit } from "@/toolkits/types";
import { cn } from "@/lib/utils";

interface Props {
  toolkitId: string;
  toolkit: ClientToolkit;
}

export const ToolkitTableRow: React.FC<Props> = async ({
  toolkitId,
  toolkit,
}) => {
  const usageData = await api.toolkits.getToolkitById(toolkitId);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
            {<toolkit.icon className="text-primary h-4 w-4" />}
          </div>
          <div>
            <div className="font-semibold">{toolkit.name}</div>
            <div className="text-muted-foreground text-xs">{toolkitId}</div>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-center text-lg font-bold">
        {Object.keys(toolkit.tools).length}
      </TableCell>

      <TableCell
        className={cn(
          "text-center",
          usageData ? "text-lg font-bold" : "text-muted-foreground/80",
        )}
      >
        {usageData
          ? usageData.tools.reduce((acc, tool) => acc + tool.usageCount, 0)
          : "Not Synced"}
      </TableCell>

      <TableCell className="text-center">
        {usageData
          ? usageData.tools.filter((tool) => tool.usageCount > 0).length
          : "Not Synced"}
      </TableCell>
    </TableRow>
  );
};
