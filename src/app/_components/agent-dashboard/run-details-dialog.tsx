"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Copy,
  Download,
  Eye,
  EyeOff,
  ArrowLeft,
  Activity,
  Timer,
  DollarSign,
  Terminal,
  Package,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentRun, AgentRunOutput } from "./types";
import { useAgentRun } from "@/app/_hooks/use-agent-run";

interface RunDetailsDashboardProps {
  runId: string;
}

const getStatusIcon = (status: AgentRun["status"]) => {
  switch (status) {
    case "QUEUED":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "EXECUTING":
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    case "COMPLETED":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "FAILED":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "CANCELED":
      return <XCircle className="h-5 w-5 text-gray-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: AgentRun["status"]) => {
  const baseClasses = "flex items-center gap-2 px-3 py-1.5 text-sm font-medium";
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

const formatDuration = (durationMs?: number) => {
  if (!durationMs) return "N/A";
  const seconds = Math.round(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const formatCost = (costInCents?: number) => {
  if (!costInCents) return "N/A";
  return `$${(costInCents / 100).toFixed(4)}`;
};

const getUsageInfo = (output?: AgentRunOutput) => {
  if (!output) return null;
  
  // Try our ergonomic structure
  if (typeof output === 'object' && (output as any).success && (output as any).data?.usage) {
    return (output as any).data.usage;
  }
  
  // Try direct usage field
  if (typeof output === 'object' && (output as any).usage) {
    return (output as any).usage;
  }
  
  return null;
};

export const RunDetailsDashboard: React.FC<RunDetailsDashboardProps> = ({
  runId,
}) => {
  const [showRawOutput, setShowRawOutput] = useState(false);
  const { run, isLoading, error } = useAgentRun({ runId, enabled: true });
  const router = useRouter();
  
  // Debug logging
  React.useEffect(() => {
    if (run) {
      console.log("RunDetailsDashboard - Full run object:", run);
      console.log("RunDetailsDashboard - Output structure:", {
        hasOutput: !!run.output,
        outputType: typeof run.output,
        outputKeys: run.output && typeof run.output === 'object' ? Object.keys(run.output) : [],
        prompt: run.prompt,
        model: run.model,
        toolkits: run.toolkits,
      });
    }
  }, [run]);

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Agent Run Details</h1>
          </div>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Error Loading Run</h3>
                <p className="text-sm text-red-500">Failed to load run details: {error.message}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading || !run) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Agent Run Details</h1>
          </div>
          
          <Card className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading run details...</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadOutput = () => {
    if (!run.output) return;
    
    const blob = new Blob([JSON.stringify(run.output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-run-${run.taskId.slice(-8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Output downloaded");
  };

  // Parse the output to extract the response text
  const getDisplayOutput = () => {
    if (!run.output) return null;
    
    if (showRawOutput) {
      return JSON.stringify(run.output, null, 2);
    }
    
    // Handle different possible output structures
    if (typeof run.output === 'object') {
      // Try our ergonomic structure first
      if ((run.output as any).success && (run.output as any).data?.response) {
        return (run.output as any).data.response;
      }
      
      // Try direct response field
      if ((run.output as any).response) {
        return (run.output as any).response;
      }
      
      // Try text field
      if ((run.output as any).text) {
        return (run.output as any).text;
      }
    }
    
    // If it's a string, return it directly
    if (typeof run.output === 'string') {
      return run.output;
    }
    
    // Fallback - show that we have output but can't parse it
    return "Output available but cannot be displayed";
  };

  const getDisplayError = () => {
    // Check for structured error in output
    if (run.output && typeof run.output === 'object') {
      const output = run.output as any;
      if (!output.success && output.error) {
        if (typeof output.error === 'string') {
          return output.error;
        }
        if (typeof output.error === 'object' && output.error.message) {
          return output.error.message;
        }
      }
    }
    
    // Fallback to legacy error field
    if (!run.error) return null;
    
    // Handle both string and JSON error formats
    if (typeof run.error === 'string') {
      try {
        const parsed = JSON.parse(run.error);
        return parsed.message || parsed.error || parsed.reason || run.error;
      } catch {
        return run.error;
      }
    }
    
    return String(run.error);
  };

  const usageInfo = getUsageInfo(run.output);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Agent Run Details</h1>
                <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md">
                  {run.taskId.slice(-8)}
                </code>
                {getStatusBadge(run.status)}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {new Date(run.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Status Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(run.status)}
                  <span className="font-semibold capitalize">{run.status.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Duration Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-xl font-semibold mt-1">{formatDuration(run.durationMs)}</p>
              </div>
            </div>
          </Card>

          {/* Cost Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost</p>
                <p className="text-xl font-semibold mt-1">{formatCost(run.costInCents)}</p>
              </div>
            </div>
          </Card>

          {/* Model Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Terminal className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Model</p>
                <div className="mt-1">
                  <p className="font-semibold">{run.model.split("/")[1]}</p>
                  <p className="text-xs text-muted-foreground">{run.model.split("/")[0]}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Prompt */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Input Prompt</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(run.prompt)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">{run.prompt}</pre>
              </div>
            </Card>

            {/* Output */}
            {run.status === "COMPLETED" && run.output && getDisplayOutput() && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Agent Output</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRawOutput(!showRawOutput)}
                      className="flex items-center gap-2"
                    >
                      {showRawOutput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showRawOutput ? "Formatted" : "Raw"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getDisplayOutput() || "")}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadOutput}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                    {getDisplayOutput()}
                  </pre>
                </div>
              </Card>
            )}

            {/* Error */}
            {run.status === "FAILED" && getDisplayError() && (
              <Card className="p-6 border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Error Details</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(getDisplayError() || "")}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-red-700 dark:text-red-300">
                    {getDisplayError()}
                  </pre>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Timestamps */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="mt-1">
                    <p className="text-sm font-mono">{new Date(run.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {run.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed</label>
                    <div className="mt-1">
                      <p className="text-sm font-mono">{new Date(run.completedAt).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(run.completedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Toolkits */}
            {run.toolkits.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Toolkits Used</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {run.toolkits.map((toolkit: string) => (
                    <Badge key={toolkit} variant="secondary" className="px-3 py-1">
                      {toolkit}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Usage Information */}
            {run.status === "COMPLETED" && usageInfo && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Usage Information</h3>
                <div className="space-y-3">
                  {usageInfo?.promptTokens && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Prompt Tokens</span>
                      <span className="font-mono text-sm">{usageInfo.promptTokens.toLocaleString()}</span>
                    </div>
                  )}
                  {usageInfo?.completionTokens && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completion Tokens</span>
                      <span className="font-mono text-sm">{usageInfo.completionTokens.toLocaleString()}</span>
                    </div>
                  )}
                  {usageInfo?.totalTokens && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Tokens</span>
                      <span className="font-mono text-sm">{usageInfo.totalTokens.toLocaleString()}</span>
                    </div>
                  )}
                  {usageInfo?.steps && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Steps</span>
                      <span className="font-mono text-sm">{usageInfo.steps}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 