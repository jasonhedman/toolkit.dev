import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { StravaTools } from "./tools";
import {
  getAthleteProfileTool,
  getAthleteActivitiesTool,
  getActivityDetailsTool,
  getAthleteStatsTool,
  searchSegmentsTool,
  getSegmentDetailsTool,
  getSegmentLeaderboardTool,
  getRoutesTool,
  getAthleteZonesTool,
} from "./tools";

export const stravaParameters = z.object({});

export const baseStravaToolkitConfig: ToolkitConfig<
  StravaTools,
  typeof stravaParameters.shape
> = {
  tools: {
    [StravaTools.GetAthleteProfile]: getAthleteProfileTool,
    [StravaTools.GetAthleteActivities]: getAthleteActivitiesTool,
    [StravaTools.GetActivityDetails]: getActivityDetailsTool,
    [StravaTools.GetAthleteStats]: getAthleteStatsTool,
    [StravaTools.SearchSegments]: searchSegmentsTool,
    [StravaTools.GetSegmentDetails]: getSegmentDetailsTool,
    [StravaTools.GetSegmentLeaderboard]: getSegmentLeaderboardTool,
    [StravaTools.GetRoutes]: getRoutesTool,
    [StravaTools.GetAthleteZones]: getAthleteZonesTool,
  },
  parameters: stravaParameters,
}; 