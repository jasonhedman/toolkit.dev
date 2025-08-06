import { api } from "@/trpc/server";

export default async function ToolkitsPage() {
  const [topToolkits, overallStats, allToolkits] = await Promise.all([
    api.toolkits.getTopToolkits({ limit: 10 }),
    api.toolkits.getOverallStats(),
    api.toolkits.getAllToolkits(),
  ]);

  console.log({ topToolkits, overallStats, allToolkits });
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Toolkit Leaderboard</h1>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Overall Statistics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    <p className="text-muted-foreground">{toolkit.id}</p>
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
        <h2 className="mb-4 text-2xl font-semibold">
          Debug: All Toolkits Data
        </h2>
        <div className="bg-muted rounded-lg p-4">
          <pre className="overflow-x-auto text-sm">
            {JSON.stringify(allToolkits, null, 2)}
          </pre>
        </div>
      </div>

      <details className="mb-8">
        <summary className="mb-4 cursor-pointer text-lg font-medium">
          Debug: Raw API Responses
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
        </div>
      </details>
    </div>
  );
}
