import { api } from "@/trpc/react";
import { toast } from "sonner";

export const useCancelAgentRun = () => {
  const utils = api.useUtils();

  const mutation = api.agents.cancelRun.useMutation({
    onSuccess: () => {
      toast.success("Run cancelled successfully");
      // Invalidate the runs list to refetch updated data
      utils.agents.listRuns.invalidate();
    },
    onError: (error) => {
      console.error("Error cancelling run:", error);
      toast.error("Failed to cancel run");
    },
  });

  const cancelRun = (runId: string) => {
    return mutation.mutate({ runId });
  };

  return {
    cancelRun,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}; 