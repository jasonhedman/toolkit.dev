import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, TrendingUp, Heart, Zap } from "lucide-react";

interface ActivityCardProps {
  activity: {
    id: number;
    name: string;
    type: string;
    start_date_local: string;
    distance: number;
    moving_time: number;
    total_elevation_gain: number;
    average_speed: number;
    average_heartrate?: number;
    max_heartrate?: number;
    kudos_count: number;
    achievement_count: number;
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatSpeed = (mps: number) => {
    const kmh = mps * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
        return '🏃';
      case 'ride':
        return '🚴';
      case 'swim':
        return '🏊';
      case 'hike':
        return '🥾';
      default:
        return '🏃';
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <div>
              <CardTitle className="text-lg font-semibold">{activity.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{formatDate(activity.start_date_local)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {activity.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{formatDistance(activity.distance)}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">{formatTime(activity.moving_time)}</p>
              <p className="text-xs text-muted-foreground">Moving Time</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">{activity.total_elevation_gain.toFixed(0)}m</p>
              <p className="text-xs text-muted-foreground">Elevation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">{formatSpeed(activity.average_speed)}</p>
              <p className="text-xs text-muted-foreground">Avg Speed</p>
            </div>
          </div>
        </div>

        {activity.average_heartrate && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Heart className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">
                {Math.round(activity.average_heartrate)} bpm
                {activity.max_heartrate && ` (max ${Math.round(activity.max_heartrate)})`}
              </p>
              <p className="text-xs text-muted-foreground">Heart Rate</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              ❤️ {activity.kudos_count}
            </span>
            {activity.achievement_count > 0 && (
              <span className="text-sm text-muted-foreground">
                🏆 {activity.achievement_count}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 