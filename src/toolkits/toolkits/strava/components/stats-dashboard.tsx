import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, TrendingUp, Trophy, Target } from "lucide-react";

interface StatsData {
  recent_ride_totals: ActivityTotals;
  recent_run_totals: ActivityTotals;
  recent_swim_totals: ActivityTotals;
  ytd_ride_totals: ActivityTotals;
  ytd_run_totals: ActivityTotals;
  ytd_swim_totals: ActivityTotals;
  all_ride_totals: ActivityTotals;
  all_run_totals: ActivityTotals;
  all_swim_totals: ActivityTotals;
}

interface ActivityTotals {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

interface StatsDashboardProps {
  stats: StatsData;
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatElevation = (meters: number) => {
    return `${meters.toFixed(0)} m`;
  };

  const StatCard = ({ 
    title, 
    icon: Icon, 
    totals, 
    color = "blue" 
  }: { 
    title: string; 
    icon: any; 
    totals: ActivityTotals; 
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-lg font-bold">{totals.count}</p>
            <p className="text-xs text-muted-foreground">Activities</p>
          </div>
          <div>
            <p className="text-lg font-bold">{formatDistance(totals.distance)}</p>
            <p className="text-xs text-muted-foreground">Distance</p>
          </div>
          <div>
            <p className="text-lg font-bold">{formatTime(totals.moving_time)}</p>
            <p className="text-xs text-muted-foreground">Moving Time</p>
          </div>
          <div>
            <p className="text-lg font-bold">{formatElevation(totals.elevation_gain)}</p>
            <p className="text-xs text-muted-foreground">Elevation</p>
          </div>
        </div>
        {totals.achievement_count !== undefined && totals.achievement_count > 0 && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{totals.achievement_count} achievements</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ActivityTypeSection = ({ 
    title, 
    recent, 
    ytd, 
    allTime, 
    color 
  }: { 
    title: string; 
    recent: ActivityTotals; 
    ytd: ActivityTotals; 
    allTime: ActivityTotals; 
    color: string;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline" className={`text-${color}-600 border-${color}-300`}>
          {recent.count} recent
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Last 4 Weeks"
          icon={Clock}
          totals={recent}
          color={color}
        />
        <StatCard
          title="Year to Date"
          icon={Target}
          totals={ytd}
          color={color}
        />
        <StatCard
          title="All Time"
          icon={TrendingUp}
          totals={allTime}
          color={color}
        />
      </div>

      {/* Progress comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Year Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Distance</span>
              <span>{formatDistance(ytd.distance)} / {formatDistance(allTime.distance)}</span>
            </div>
            <Progress 
              value={(ytd.distance / allTime.distance) * 100} 
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Activities</span>
              <span>{ytd.count} / {allTime.count}</span>
            </div>
            <Progress 
              value={(ytd.count / allTime.count) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Activity Statistics</h2>
        <Badge variant="outline">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      <Tabs defaultValue="running" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="running">🏃 Running</TabsTrigger>
          <TabsTrigger value="cycling">🚴 Cycling</TabsTrigger>
          <TabsTrigger value="swimming">🏊 Swimming</TabsTrigger>
        </TabsList>

        <TabsContent value="running" className="space-y-4">
          <ActivityTypeSection
            title="Running Statistics"
            recent={stats.recent_run_totals}
            ytd={stats.ytd_run_totals}
            allTime={stats.all_run_totals}
            color="green"
          />
        </TabsContent>

        <TabsContent value="cycling" className="space-y-4">
          <ActivityTypeSection
            title="Cycling Statistics"
            recent={stats.recent_ride_totals}
            ytd={stats.ytd_ride_totals}
            allTime={stats.all_ride_totals}
            color="blue"
          />
        </TabsContent>

        <TabsContent value="swimming" className="space-y-4">
          <ActivityTypeSection
            title="Swimming Statistics"
            recent={stats.recent_swim_totals}
            ytd={stats.ytd_swim_totals}
            allTime={stats.all_swim_totals}
            color="cyan"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 