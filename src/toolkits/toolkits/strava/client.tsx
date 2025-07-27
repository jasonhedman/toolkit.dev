import { SiStrava } from "@icons-pack/react-simple-icons";

import { createClientToolkit } from "@/toolkits/create-toolkit";

import { baseStravaToolkitConfig } from "./base";
import { StravaTools } from "./tools";
import {
  stravaGetAthleteProfileToolConfigClient,
  stravaGetAthleteActivitiesToolConfigClient,
  stravaGetActivityDetailsToolConfigClient,
  stravaGetAthleteStatsToolConfigClient,
  stravaSearchSegmentsToolConfigClient,
  stravaGetSegmentDetailsToolConfigClient,
  stravaGetSegmentLeaderboardToolConfigClient,
  stravaGetRoutesToolConfigClient,
  stravaGetAthleteZonesToolConfigClient,
} from "./tools/client";

import { ToolkitGroups } from "@/toolkits/types";

import { StravaWrapper } from "./wrapper";

export const stravaClientToolkit = createClientToolkit(
  baseStravaToolkitConfig,
  {
    name: "Strava",
    description: "Access your fitness data, activities, performance analytics, and training insights",
    icon: SiStrava,
    form: null,
    Wrapper: StravaWrapper,
    type: ToolkitGroups.DataSource,
  },
  {
    [StravaTools.GetAthleteProfile]: stravaGetAthleteProfileToolConfigClient,
    [StravaTools.GetAthleteActivities]: stravaGetAthleteActivitiesToolConfigClient,
    [StravaTools.GetActivityDetails]: stravaGetActivityDetailsToolConfigClient,
    [StravaTools.GetAthleteStats]: stravaGetAthleteStatsToolConfigClient,
    [StravaTools.SearchSegments]: stravaSearchSegmentsToolConfigClient,
    [StravaTools.GetSegmentDetails]: stravaGetSegmentDetailsToolConfigClient,
    [StravaTools.GetSegmentLeaderboard]: stravaGetSegmentLeaderboardToolConfigClient,
    [StravaTools.GetRoutes]: stravaGetRoutesToolConfigClient,
    [StravaTools.GetAthleteZones]: stravaGetAthleteZonesToolConfigClient,
  },
); 