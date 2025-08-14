"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

export const SyncButton = () => {
  const router = useRouter();
  const utils = api.useUtils();
  const {
    mutate: syncToolUsage,
    isPending,
    isSuccess,
  } = api.sync.syncToolUsage.useMutation({
    onSuccess: async () => {
      await utils.toolkits.getOverallStats.invalidate();
      router.refresh();
      toast.success("Tool usage synced");
    },
  });

  return (
    <Button onClick={() => void syncToolUsage()} disabled={isPending}>
      {isSuccess ? (
        <Check className="" />
      ) : isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        "Sync"
      )}
    </Button>
  );
};
