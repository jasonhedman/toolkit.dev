export interface AgentRunOutput {
  success: boolean;
  data?: {
    response: string;
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      steps: number;
    };
    toolResults: any[];
    input: {
      model: string;
      prompt: string;
      toolkits: string[];
      systemPrompt?: string;
      useNativeSearch: boolean;
    };
    metadata: {
      taskId: string;
      timestamp: string;
    };
  };
  error?: {
    message: string;
    timestamp: string;
    taskId: string;
  };
}

export interface AgentRun {
  id: string;
  taskId: string;
  status: "WAITING_FOR_DEPLOY" | "QUEUED" | "EXECUTING" | "REATTEMPTING" | "FROZEN" | "COMPLETED" | "CANCELED" | "FAILED" | "CRASHED" | "INTERRUPTED" | "SYSTEM_FAILURE" | "DELAYED" | "EXPIRED" | "TIMED_OUT";
  model: string;
  prompt: string;
  toolkits: string[];
  createdAt: string;
  completedAt?: string;
  output?: AgentRunOutput;
  error?: string;
  durationMs?: number;
  costInCents?: number;
  metadata?: Record<string, any>;
} 