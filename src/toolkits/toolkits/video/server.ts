import { Strava } from "strava";

import { createServerToolkit } from "@/toolkits/create-toolkit";

import { env } from "@/env";

import { api } from "@/trpc/server";

import { baseVideoToolkitConfig } from "./base";
import { Video } from "./tools";

import { getAthleteProfileToolConfigServer } from "./tools/profile/server";
import { getActivityDetailsToolConfigServer } from "./tools/activity-details/server";
import { getActivitiesToolConfigServer } from "./tools/activities/server";
import { getAthleteStatsToolConfigServer } from "./tools/stats/server";
import { getAthleteZonesToolConfigServer } from "./tools/zones/server";
import { getRoutesToolConfigServer } from "./tools/routes/server";
import { getSegmentDetailsToolConfigServer } from "./tools/segment/server";
import { exploreSegmentsToolConfigServer } from "./tools/explore-segments/server";

export const stravaToolkitServer = createServerToolkit(
  baseStravaToolkitConfig,
  `You have access to the comprehensive Strava toolkit for fitness tracking and activity analysis. This toolkit provides:

- **Athlete Profile** - Get user information and premium status
- **Activity Management** - List activities with filtering and get detailed workout analysis
- **Performance Analytics** - Comprehensive statistics and training zones
- **Segment Exploration** - Search segments, get details, and view leaderboards
- **Route Planning** - Access saved routes (Premium feature)

Use these tools to help users analyze their fitness data, track performance trends, explore popular segments, and gain insights into their training patterns.`,
  async () => {
    const account = await api.accounts.getAccountByProvider("strava");

    if (!account?.refresh_token) {
      throw new Error(
        "No Strava account found. Please connect your Strava account first.",
      );
    }

    const strava = new Strava({
      client_id: env.AUTH_STRAVA_ID,
      client_secret: env.AUTH_STRAVA_SECRET,
      refresh_token: account.refresh_token,
    });

    return {
      [StravaTools.GetAthleteProfile]:
        getAthleteProfileToolConfigServer(strava),
      [StravaTools.GetAthleteActivities]: getActivitiesToolConfigServer(strava),
      [StravaTools.GetActivityDetails]:
        getActivityDetailsToolConfigServer(strava),
      [StravaTools.GetAthleteStats]: getAthleteStatsToolConfigServer(strava),
      [StravaTools.ExploreSegments]: exploreSegmentsToolConfigServer(strava),
      [StravaTools.GetSegmentDetails]:
        getSegmentDetailsToolConfigServer(strava),
      [StravaTools.GetRoutes]: getRoutesToolConfigServer(strava),
      [StravaTools.GetAthleteZones]: getAthleteZonesToolConfigServer(strava),
    };
  },
);
