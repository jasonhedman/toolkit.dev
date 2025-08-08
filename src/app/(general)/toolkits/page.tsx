import { api } from "@/trpc/server";

export default async function ToolkitsPage() {
  const [topToolkits, overallStats, allToolkits, topTools, zeroUsageTools] =
    await Promise.all([
      api.toolkits.getTopToolkits({ limit: 10 }),
      api.toolkits.getOverallStats(),
      api.toolkits.getAllToolkits(),
      api.tools.getTopTools({ limit: 10 }),
      api.tools.getZeroUsageTools(),
    ]);

  console.log({
    topToolkits,
    overallStats,
    allToolkits,
    topTools,
    zeroUsageTools,
  });

  const toolkitEfficiency = allToolkits
    .map((toolkit) => ({
      id: toolkit.id,
      totalTools: toolkit.tools.length,
      usedTools: toolkit.tools.filter((tool) => tool.usageCount > 0).length,
      totalUsage: toolkit.tools.reduce((sum, tool) => sum + tool.usageCount, 0),
      avgUsagePerTool:
        toolkit.tools.length > 0
          ? Math.round(
              (toolkit.tools.reduce((sum, tool) => sum + tool.usageCount, 0) /
                toolkit.tools.length) *
                100,
            ) / 100
          : 0,
      utilizationRate:
        toolkit.tools.length > 0
          ? Math.round(
              (toolkit.tools.filter((tool) => tool.usageCount > 0).length /
                toolkit.tools.length) *
                100,
            )
          : 0,
    }))
    .sort((a, b) => b.avgUsagePerTool - a.avgUsagePerTool);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Toolkit Leaderboard</h1>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Overall Statistics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-medium">Total Toolkits</h3>
            <p className="text-3xl font-bold">{overallStats.toolkitCount}</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-medium">Total Tools</h3>
            <p className="text-3xl font-bold">{overallStats.toolCount}</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-medium">Total Usage</h3>
            <p className="text-3xl font-bold">{overallStats.totalUsage}</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-medium">Unused Tools</h3>
            <p className="text-3xl font-bold">{zeroUsageTools.length}</p>
            <p className="text-muted-foreground text-sm">
              {Math.round(
                (zeroUsageTools.length / overallStats.toolCount) * 100,
              )}
              % of tools
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Top Tools</h2>
        <div className="space-y-3">
          {topTools.slice(0, 5).map((tool, index) => (
            <div
              key={`${tool.toolkit.id}_${tool.id}`}
              className="bg-card rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-muted-foreground font-bold">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold">{tool.id}</h4>
                    <p className="text-muted-foreground text-sm">
                      from {tool.toolkit.id} toolkit
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{tool.usageCount}</p>
                  <p className="text-muted-foreground text-sm">uses</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Toolkit Efficiency</h2>
        <div className="space-y-4">
          {toolkitEfficiency.slice(0, 8).map((toolkit, index) => (
            <div key={toolkit.id} className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground text-xl font-bold">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{toolkit.id}</h3>
                    <p className="text-muted-foreground text-sm">
                      {toolkit.usedTools}/{toolkit.totalTools} tools used (
                      {toolkit.utilizationRate}% utilization)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{toolkit.avgUsagePerTool}</p>
                  <p className="text-muted-foreground text-sm">avg uses/tool</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Top Toolkits</h2>
        <div className="space-y-4">
          {topToolkits.map((toolkit, index) => (
            <div key={toolkit.id} className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground text-2xl font-bold">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{toolkit.id}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {toolkit.toolCount} tools
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{toolkit.totalUsage}</p>
                  <p className="text-muted-foreground text-sm">uses</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">All Toolkits Data</h2>
        <div className="bg-muted rounded-lg p-4">
          <pre className="overflow-x-auto text-sm">
            {JSON.stringify(allToolkits, null, 2)}
          </pre>
        </div>
      </div>

      <details className="mb-8">
        <summary className="mb-4 cursor-pointer text-lg font-medium">
          API Responses
        </summary>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-medium">Top Toolkits Response:</h3>
            <pre className="bg-muted overflow-x-auto rounded p-4 text-xs">
              {JSON.stringify(topToolkits, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Overall Stats Response:</h3>
            <pre className="bg-muted overflow-x-auto rounded p-4 text-xs">
              {JSON.stringify(overallStats, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Top Tools Response:</h3>
            <pre className="bg-muted overflow-x-auto rounded p-4 text-xs">
              {JSON.stringify(topTools, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Toolkit Efficiency Metrics:</h3>
            <pre className="bg-muted overflow-x-auto rounded p-4 text-xs">
              {JSON.stringify(toolkitEfficiency, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
