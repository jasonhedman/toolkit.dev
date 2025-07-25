import { api } from "@/trpc/react";
import { toast } from "sonner";

interface AgentConfig {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  toolkits?: Array<{ id: string; parameters: Record<string, any> }>;
  selectedChatModel?: string;
  systemPrompt?: string;
  useNativeSearch?: boolean;
}

export const useRunAgent = () => {
  const mutation = api.agents.run.useMutation({
    onSuccess: (data) => {
      toast.success(`Agent run started! Task ID: ${data.taskId}`);
    },
    onError: (error) => {
      console.error("Error starting agent run:", error);
      toast.error("Failed to start agent run");
    },
  });

  const runAgent = (config: AgentConfig) => {
    return mutation.mutate(config);
  };

  return {
    runAgent,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}; 