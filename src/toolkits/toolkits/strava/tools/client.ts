import { createClientTool } from "@/toolkits/create-tool";
import {
  getAthleteProfileTool,
  getAthleteStatsTool,
  getAthleteZonesTool,
} from "./athlete/base";
import { 
  getAthleteActivitiesTool,
  getActivityDetailsTool
} from "./activities/base";
import {
  searchSegmentsTool,
  getSegmentDetailsTool,
  getSegmentLeaderboardTool,
} from "./segments/base";
import { getRoutesTool } from "./routes/base";

export const stravaGetAthleteProfileToolConfigClient = createClientTool(getAthleteProfileTool);

export const stravaGetAthleteActivitiesToolConfigClient = createClientTool(getAthleteActivitiesTool);

export const stravaGetActivityDetailsToolConfigClient = createClientTool(getActivityDetailsTool);

export const stravaGetAthleteStatsToolConfigClient = createClientTool(getAthleteStatsTool);

export const stravaSearchSegmentsToolConfigClient = createClientTool(searchSegmentsTool);

export const stravaGetSegmentDetailsToolConfigClient = createClientTool(getSegmentDetailsTool);

export const stravaGetSegmentLeaderboardToolConfigClient = createClientTool(getSegmentLeaderboardTool);

export const stravaGetRoutesToolConfigClient = createClientTool(getRoutesTool);

export const stravaGetAthleteZonesToolConfigClient = createClientTool(getAthleteZonesTool); 