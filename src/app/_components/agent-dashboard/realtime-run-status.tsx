"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface Props {
  runId: string;
  onComplete?: (run: AgentRun) => void;
}

export const RealtimeRunStatus: React.FC<Props> = ({ runId, onComplete }) => {
  const [run, setRun] = useState<AgentRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRunStatus = async () => {
    try {
      const response = await fetch(`/api/agent/runs?runId=${runId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch run status");
      }
      const data = await response.json();
      const foundRun = data.runs?.find((r: AgentRun) => r.taskId === runId);
      if (foundRun) {
        setRun(foundRun);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunStatus();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchRunStatus, 2000);
    
    return () => clearInterval(interval);
  }, [runId]);

  React.useEffect(() => {
    if (run?.status === "COMPLETED" && onComplete) {
      onComplete(run);
    }
  }, [run?.status, onComplete, run]);

  if (error) {
    return (
      <Card className="p-4 border-red-200">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-4 w-4" />
          <span className="text-sm">Error loading run status: {error}</span>
        </div>
      </Card>
    );
  }

  if (!run) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading run status...</span>
        </div>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (run.status) {
      case "QUEUED":
      case "WAITING_FOR_DEPLOY":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "EXECUTING":
      case "REATTEMPTING":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
      case "CRASHED":
      case "SYSTEM_FAILURE":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "CANCELED":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (run.status) {
      case "COMPLETED":
        return "text-green-700 border-green-500";
      case "EXECUTING":
      case "REATTEMPTING":
        return "text-blue-700 border-blue-500";
      case "FAILED":
      case "CRASHED":
      case "SYSTEM_FAILURE":
        return "text-red-700 border-red-500";
      case "CANCELED":
        return "text-gray-700 border-gray-500";
      default:
        return "text-yellow-700 border-yellow-500";
    }
  };

  const getProgress = () => {
    switch (run.status) {
      case "QUEUED":
      case "WAITING_FOR_DEPLOY":
        return 10;
      case "EXECUTING":
      case "REATTEMPTING":
        return 50;
      case "COMPLETED":
        return 100;
      case "FAILED":
      case "CRASHED":
      case "CANCELED":
      case "SYSTEM_FAILURE":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Agent Run Status</h3>
          <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            {run.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Run ID:</span>
            <div className="font-mono">{run.id}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Started:</span>
            <div>{formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <div>{run.durationMs ? `${Math.round(run.durationMs / 1000)}s` : "-"}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Cost:</span>
            <div>{run.costInCents ? `$${(run.costInCents / 100).toFixed(3)}` : "-"}</div>
          </div>
        </div>

        {run.metadata && Object.keys(run.metadata).length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Metadata:</span>
            <div className="bg-muted p-2 rounded text-xs font-mono max-h-20 overflow-y-auto">
              {JSON.stringify(run.metadata, null, 2)}
            </div>
          </div>
        )}

        {run.error && (
          <div className="space-y-2">
            <span className="text-sm text-red-600">Error:</span>
            <div className="bg-red-50 p-2 rounded text-xs font-mono max-h-20 overflow-y-auto text-red-800">
              {JSON.stringify(run.error, null, 2)}
            </div>
          </div>
        )}

        {run.output && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Output:</span>
            <div className="bg-muted p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
              {typeof run.output === 'string' ? run.output : JSON.stringify(run.output, null, 2)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 