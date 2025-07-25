"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  MoreHorizontal, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useAgentRuns } from "@/app/_hooks/use-agent-runs";
import { useCancelAgentRun } from "@/app/_hooks/use-cancel-agent-run";

interface AgentRun {
  id: string;
  taskId: string;
  status: "WAITING_FOR_DEPLOY" | "QUEUED" | "EXECUTING" | "REATTEMPTING" | "FROZEN" | "COMPLETED" | "CANCELED" | "FAILED" | "CRASHED" | "INTERRUPTED" | "SYSTEM_FAILURE" | "DELAYED" | "EXPIRED" | "TIMED_OUT";
  model: string;
  prompt: string;
  toolkits: string[];
  createdAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
  durationMs?: number;
  costInCents?: number;
  metadata?: Record<string, any>;
}

const getStatusIcon = (status: AgentRun["status"]) => {
  switch (status) {
    case "QUEUED":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "EXECUTING":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "COMPLETED":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "CANCELED":
      return <XCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: AgentRun["status"]) => {
  const baseClasses = "flex items-center gap-1";
  switch (status) {
    case "QUEUED":
      return <Badge variant="outline" className={baseClasses}>
        {getStatusIcon(status)}
        Queued
      </Badge>;
    case "EXECUTING":
      return <Badge variant="outline" className={`${baseClasses} border-blue-500 text-blue-700`}>
        {getStatusIcon(status)}
        Running
      </Badge>;
    case "COMPLETED":
      return <Badge variant="outline" className={`${baseClasses} border-green-500 text-green-700`}>
        {getStatusIcon(status)}
        Completed
      </Badge>;
    case "FAILED":
      return <Badge variant="outline" className={`${baseClasses} border-red-500 text-red-700`}>
        {getStatusIcon(status)}
        Failed
      </Badge>;
    case "CANCELED":
      return <Badge variant="outline" className={`${baseClasses} border-gray-500 text-gray-700`}>
        {getStatusIcon(status)}
        Cancelled
      </Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const AgentRunsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { runs, isLoading, refetch } = useAgentRuns({
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  
  const { cancelRun } = useCancelAgentRun();

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesSearch = 
        run.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.taskId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || run.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [runs, searchTerm, statusFilter]);

  const viewRunDetails = (run: any) => {
    // Open a modal or navigate to details page
    toast.info(`Viewing details for run: ${run.taskId}`);
  };

  if (isLoading && runs.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading agent runs...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search runs by prompt, model, or task ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Status: {statusFilter === "all" ? "All" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("QUEUED")}>
              Queued
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("EXECUTING")}>
              Running
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("FAILED")}>
              Failed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Task ID</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Toolkits</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRuns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No runs match your filters" 
                    : "No agent runs yet. Start by configuring and running an agent."
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    {getStatusBadge(run.status)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {run.taskId.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{run.model.split("/")[1]}</span>
                      <span className="text-xs text-muted-foreground">{run.model.split("/")[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="truncate" title={run.prompt}>
                      {run.prompt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {run.toolkits.slice(0, 2).map((toolkit: string) => (
                        <Badge key={toolkit} variant="secondary" className="text-xs">
                          {toolkit}
                        </Badge>
                      ))}
                      {run.toolkits.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{run.toolkits.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {run.completedAt ? (
                      formatDistanceToNow(new Date(run.completedAt), { 
                        includeSeconds: true 
                      })
                    ) : (
                      run.status === "EXECUTING" ? "Running..." : "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewRunDetails(run)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {(run.status === "QUEUED" || run.status === "EXECUTING") && (
                          <DropdownMenuItem 
                            onClick={() => cancelRun(run.id)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Run
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}; 