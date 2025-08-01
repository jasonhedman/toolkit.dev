import { StravaWrapper } from "./wrapper";
import { SiStrava } from "@icons-pack/react-simple-icons";

import { createClientToolkit } from "@/toolkits/create-toolkit";

import { ToolkitGroups } from "@/toolkits/types";

import { baseStravaToolkitConfig } from "./base";
import { StravaTools } from "./tools";

import { getAthleteToolConfigClient } from "./tools/profile/client";
import { getActivityDetailsToolConfigClient } from "./tools/activity-details/client";
import { getActivitiesToolConfigClient } from "./tools/activities/client";
import { getAthleteStatsToolConfigClient } from "./tools/stats/client";
import { getAthleteZonesToolConfigClient } from "./tools/zones/client";
import { getRoutesToolConfigClient } from "./tools/routes/client";
import { getSegmentDetailsToolConfigClient } from "./tools/segment/client";
import { exploreSegmentsToolConfigClient } from "./tools/explore-segments/client";

import { Link } from "../components/link";

export const stravaClientToolkit = createClientToolkit(
  baseStravaToolkitConfig,
  {
    name: "Strava",
    description: "Access your Strava activities and performance data",
    icon: SiStrava,
    form: null,
    Wrapper: StravaWrapper,
    type: ToolkitGroups.DataSource,
    envVars: [
      {
        type: "all",
        keys: ["AUTH_STRAVA_ID", "AUTH_STRAVA_SECRET"],
        description: (
          <span>
            Create a Strava OAuth application{" "}
            <Link href="https://developers.strava.com/docs/getting-started/#account">
              here
            </Link>
          </span>
        ),
      },
    ],
  },
  {
    [StravaTools.GetAthleteProfile]: getAthleteToolConfigClient,
    [StravaTools.GetAthleteActivities]: getActivitiesToolConfigClient,
    [StravaTools.GetActivityDetails]: getActivityDetailsToolConfigClient,
    [StravaTools.GetAthleteStats]: getAthleteStatsToolConfigClient,
    [StravaTools.ExploreSegments]: exploreSegmentsToolConfigClient,
    [StravaTools.GetSegmentDetails]: getSegmentDetailsToolConfigClient,
    [StravaTools.GetRoutes]: getRoutesToolConfigClient,
    [StravaTools.GetAthleteZones]: getAthleteZonesToolConfigClient,
  },
);
