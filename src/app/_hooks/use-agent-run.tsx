"use client";

import { api } from "@/trpc/react";
import { useState, useEffect } from "react";

interface UseAgentRunOptions {
  runId: string | null;
  enabled?: boolean;
  pollingInterval?: number;
}

export const useAgentRun = (options: UseAgentRunOptions) => {
  const {
    runId,
    enabled = true,
    pollingInterval = 2000, // Poll more frequently for individual runs
  } = options;

  const [isPolling, setIsPolling] = useState(false);

  const query = api.agents.getRun.useQuery(
    {
      runId: runId!,
    },
    {
      enabled: enabled && !!runId,
      refetchInterval: isPolling ? pollingInterval : false,
    }
  );

  // Start polling when the run is active
  useEffect(() => {
    if (query.data?.run) {
      const isActive = query.data.run.status === "QUEUED" || query.data.run.status === "EXECUTING";
      setIsPolling(isActive);
    }
  }, [query.data?.run]);

  const refetch = () => {
    return query.refetch();
  };

  return {
    run: query.data?.run,
    isLoading: query.isLoading,
    error: query.error,
    refetch,
    isPolling,
  };
}; 