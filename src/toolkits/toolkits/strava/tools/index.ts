export enum StravaTools {
  GetAthleteProfile = "get-athlete-profile",
  GetAthleteActivities = "get-athlete-activities",
  GetActivityDetails = "get-activity-details",
  GetAthleteStats = "get-athlete-stats",
  SearchSegments = "search-segments",
  GetSegmentDetails = "get-segment-details",
  GetSegmentLeaderboard = "get-segment-leaderboard",
  GetRoutes = "get-routes",
  GetAthleteZones = "get-athlete-zones",
}

export * from "./athlete/base";
export * from "./activities/base";
export * from "./segments/base";
export * from "./routes/base"; 