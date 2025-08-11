"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

type Timeframe = "today" | "week" | "month" | "all";

interface TopModel {
  rank: number;
  modelId: string;
  modelName: string;
  provider: string;
  messageCount: number;
  percentage: string;
}

interface ProviderShare {
  provider: string;
  messageCount: number;
  percentage: string;
}

interface OverallStats {
  totalMessages: number;
  uniqueModels: number;
  uniqueProviders: number;
  timeframe: Timeframe;
}

interface ModelsLeaderboardProps {
  initialTopModels: TopModel[];
  initialProviderShare: ProviderShare[];
  initialOverallStats: OverallStats;
}

export function ModelsLeaderboard({
  initialTopModels,
  initialProviderShare,
  initialOverallStats,
}: ModelsLeaderboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("all");

  const { data: topModels, isLoading: modelsLoading } =
    api.models.getTopModels.useQuery(
      {
        limit: 20,
        timeframe: selectedTimeframe,
      },
      {
        initialData: selectedTimeframe === "all" ? initialTopModels : undefined,
      },
    );

  const { data: providerShare, isLoading: providersLoading } =
    api.models.getProviderMarketShare.useQuery(
      {
        timeframe: selectedTimeframe,
      },
      {
        initialData:
          selectedTimeframe === "all" ? initialProviderShare : undefined,
      },
    );

  const { data: overallStats, isLoading: statsLoading } =
    api.models.getOverallStats.useQuery(
      {
        timeframe: selectedTimeframe,
      },
      {
        initialData:
          selectedTimeframe === "all" ? initialOverallStats : undefined,
      },
    );

  const isLoading = modelsLoading || providersLoading || statsLoading;

  const timeframeLabels = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    all: "All Time",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Model Usage Leaderboard</h1>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {(["today", "week", "month", "all"] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {timeframeLabels[timeframe]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-lg">Loading model statistics...</div>
        </div>
      ) : (
        <>
          {overallStats && (
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold">
                Overall Statistics
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="mb-2 text-lg font-medium">Total Messages</h3>
                  <p className="text-3xl font-bold">
                    {overallStats.totalMessages.toLocaleString()}
                  </p>
                </div>
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="mb-2 text-lg font-medium">Unique Models</h3>
                  <p className="text-3xl font-bold">
                    {overallStats.uniqueModels}
                  </p>
                </div>
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="mb-2 text-lg font-medium">AI Providers</h3>
                  <p className="text-3xl font-bold">
                    {overallStats.uniqueProviders}
                  </p>
                </div>
              </div>
            </div>
          )}

          {topModels && (
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold">Top Models</h2>
              <div className="space-y-3">
                {topModels.map((model: TopModel) => (
                  <div
                    key={model.modelId}
                    className="bg-card rounded-lg border p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground text-2xl font-bold">
                          #{model.rank}
                        </span>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {model.modelName}
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm">
                            by {model.provider}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {model.messageCount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {model.percentage}% of messages
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {providerShare && (
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold">
                Provider Market Share
              </h2>
              <div className="space-y-3">
                {providerShare
                  .slice(0, 10)
                  .map((provider: ProviderShare, index: number) => (
                    <div
                      key={provider.provider}
                      className="bg-card rounded-lg border p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground text-xl font-bold">
                            #{index + 1}
                          </span>
                          <div>
                            <h3 className="text-lg font-semibold capitalize">
                              {provider.provider}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {provider.messageCount.toLocaleString()}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {provider.percentage}% market share
                          </p>
                        </div>
                      </div>
                      <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${provider.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <details className="mb-8">
            <summary className="mb-4 cursor-pointer text-lg font-medium">
              Models data
            </summary>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Top Models API Response:</h3>
                <pre className="bg-muted overflow-x-auto rounded p-4 text-xs">
                  {JSON.stringify(topModels, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="mb-2 font-medium">
                  Provider Share API Response:
                </h3>
                <pre className="bg-muted overflow-x-auto rounded p-4 text-xs">
                  {JSON.stringify(providerShare, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Overall Stats Response:</h3>
                <pre className="bg-muted overflow-x-auto rounded p-4 text-xs">
                  {JSON.stringify(overallStats, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
