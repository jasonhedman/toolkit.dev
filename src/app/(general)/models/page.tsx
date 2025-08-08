import { api } from "@/trpc/server";
import { ModelsLeaderboard } from "./_components/models-leaderboard";

export default async function ModelsPage() {
  const [initialTopModels, initialProviderShare, initialOverallStats] =
    await Promise.all([
      api.models.getTopModels({ limit: 20, timeframe: "all" }),
      api.models.getProviderMarketShare({ timeframe: "all" }),
      api.models.getOverallStats({ timeframe: "all" }),
    ]);

  return (
    <ModelsLeaderboard
      initialTopModels={initialTopModels}
      initialProviderShare={initialProviderShare}
      initialOverallStats={initialOverallStats}
    />
  );
}
