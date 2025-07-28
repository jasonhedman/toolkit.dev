import { api } from "@/trpc/react";
import { useState, useEffect } from "react";

interface UseAgentRunsOptions {
  limit?: number;
  status?: string;
  pollingInterval?: number;
  enabled?: boolean;
}

export const useAgentRuns = (options: UseAgentRunsOptions = {}) => {
  const {
    limit = 50,
    status,
    pollingInterval = 5000,
    enabled = true,
  } = options;

  const [isPolling, setIsPolling] = useState(false);

  const query = api.agents.listRuns.useQuery(
    {
      limit,
      status,
    },
    {
      enabled,
      refetchInterval: isPolling ? pollingInterval : false,
    }
  );

  // Start polling when there are active runs
  useEffect(() => {
    if (query.data?.runs) {
      const hasActiveRuns = query.data.runs.some(
        (run) => run.status === "QUEUED" || run.status === "EXECUTING"
      );
      setIsPolling(hasActiveRuns);
    }
  }, [query.data?.runs]);

  const refetch = () => {
    return query.refetch();
  };

  const startPolling = () => {
    setIsPolling(true);
  };

  const stopPolling = () => {
    setIsPolling(false);
  };

  return {
    runs: query.data?.runs || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch,
    startPolling,
    stopPolling,
    isPolling,
  };
}; 