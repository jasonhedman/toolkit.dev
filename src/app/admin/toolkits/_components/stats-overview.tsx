import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Activity, Zap } from "lucide-react";
import { api } from "@/trpc/server";

export async function StatsOverview() {
  const overallStats = await api.toolkits.getOverallStats();

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.totalUsage.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Tool invocations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toolkits</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.toolkitCount}
            </div>
            <p className="text-muted-foreground text-xs">Available toolkits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tools</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.toolCount}</div>
            <p className="text-muted-foreground text-xs">Total tools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <Zap className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.toolCount > 0
                ? Math.round(overallStats.totalUsage / overallStats.toolCount)
                : 0}
            </div>
            <p className="text-muted-foreground text-xs">Per tool average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
