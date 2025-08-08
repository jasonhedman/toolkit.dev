import { useEffect, useState } from "react";

import { toast } from "sonner";

import { useSearchParams } from "next/navigation";

import { setEnvVar } from "@/actions/add-env-var";

import { KeyModal } from "./key-modal";
import { InsufficientCreditsModal } from "./insufficient-credits-modal";

import { useEnvVarAvailable } from "@/contexts/env/available-env-vars";

import { api } from "@/trpc/react";

export const OpenRouterChecks = () => {
  const hasOpenRouterKey = useEnvVarAvailable("OPENROUTER_API_KEY");

  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const { data: credits } = api.credits!.getAvailableCredits.useQuery(
    undefined,
    {
      refetchInterval: 20000,
      enabled: hasOpenRouterKey,
      refetchOnWindowFocus: "always",
      refetchOnMount: "always",
      refetchOnReconnect: "always",
    },
  );

  useEffect(() => {
    const updateOpenRouterKey = async () => {
      const code = searchParams.get("code");
      if (!code) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        });

        const { key } = (await response.json()) as { key: string };

        if (!key) {
          throw new Error("Failed to set OpenRouter API key.");
        }

        const { success } = await setEnvVar([
          { key: "OPENROUTER_API_KEY", value: key },
        ]);

        if (!success) {
          toast.error("Failed to set OpenRouter API key.");
          return;
        }

        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState(
          {},
          "",
          url.pathname + url.search + url.hash,
        );
      } catch (error) {
        setIsLoading(false);
        console.error(error);
      }
    };

    if (!isLoading) {
      void updateOpenRouterKey();
    }
  }, [searchParams, isLoading]);

  if (!hasOpenRouterKey) {
    return <KeyModal />;
  }

  // if (credits && credits.totalCredits - credits.totalUsage <= 0.01) {
  //   return <InsufficientCreditsModal />;
  // }

  return null;
};
