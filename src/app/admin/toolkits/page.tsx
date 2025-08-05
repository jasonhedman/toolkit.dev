import { clientToolkits } from "@/toolkits/toolkits/client";
import { StatsOverview } from "./_components/stats-overview";
import { ToolkitTableRow } from "./_components/toolkit-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClientToolkit } from "@/toolkits/types";
import { SyncButton } from "./_components/sync-button";

export default function AdminToolkitsPage() {
  return (
    <div className="mx-auto w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Toolkit Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor toolkit usage and performance
          </p>
        </div>
        <SyncButton />
      </div>

      <StatsOverview />

      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Toolkit</TableHead>
                <TableHead className="text-center">Tools</TableHead>
                <TableHead className="text-center">Total Uses</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(clientToolkits).map(([toolkitId, toolkit]) => (
                <ToolkitTableRow
                  key={toolkitId}
                  toolkitId={toolkitId}
                  toolkit={toolkit as ClientToolkit}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
