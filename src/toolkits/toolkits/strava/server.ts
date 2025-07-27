import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseStravaToolkitConfig } from "./base";
import {
  stravaGetAthleteProfileToolConfigServer,
  stravaGetAthleteActivitiesToolConfigServer,
  stravaGetActivityDetailsToolConfigServer,
  stravaGetAthleteStatsToolConfigServer,
  stravaSearchSegmentsToolConfigServer,
  stravaGetSegmentDetailsToolConfigServer,
  stravaGetSegmentLeaderboardToolConfigServer,
  stravaGetRoutesToolConfigServer,
  stravaGetAthleteZonesToolConfigServer,
} from "./tools/server";
import { StravaTools } from "./tools";
import { api } from "@/trpc/server";
import { StravaTokenManager } from "@/lib/strava-auth";

export const stravaToolkitServer = createServerToolkit(
  baseStravaToolkitConfig,
  `You have access to the Strava toolkit for comprehensive fitness tracking and activity analysis. This toolkit provides:

- **Get Athlete Profile**: Retrieve the authenticated user's profile information, including location, premium status, and gear
- **Get Athlete Activities**: Fetch a list of activities with filters for date ranges and pagination
- **Get Activity Details**: Get detailed information about specific activities including segments, laps, and performance metrics
- **Get Athlete Stats**: Access comprehensive statistics including recent, year-to-date, and all-time totals across different activity types
- **Search Segments**: Find popular segments using geographic bounds and activity type filters
- **Get Segment Details**: Retrieve detailed information about specific segments including difficulty and location data
- **Get Segment Leaderboard**: Access leaderboards for segments with various filtering options (gender, age, weight, clubs, etc.)
- **Get Routes**: Access the athlete's saved and created routes (Premium feature)
- **Get Athlete Zones**: Retrieve heart rate and power zones for training analysis

**Tool Sequencing Strategies:**
1. **Profile Discovery**: Start with Get Athlete Profile to understand the user's setup, then use Get Athlete Stats for performance overview
2. **Activity Analysis**: Use Get Athlete Activities to find recent workouts, then Get Activity Details for deep-dive analysis of specific sessions
3. **Performance Tracking**: Combine Get Athlete Stats with Get Athlete Zones to understand training zones and long-term progress trends
4. **Route and Segment Exploration**: Use Search Segments to find challenging segments nearby, then Get Segment Details and Get Segment Leaderboard for competition analysis
5. **Training Planning**: Use Get Routes to access saved routes, combined with segment data for workout planning

**Best Practices:**
- Use date filters in Get Athlete Activities to focus on relevant time periods
- Leverage segment leaderboards to provide competitive context and motivation
- Combine activity details with athlete zones to provide personalized training insights
- Use geographic bounds in segment searches to find location-relevant challenges
- Respect rate limits: 600 requests per 15 minutes, 30,000 per day
- Premium features (routes, power zones) may not be available for all users

**Use Cases:**
- "Show me my running pace trends over the last 3 months"
- "Find popular cycling segments near San Francisco"
- "Compare my performance on this segment to other athletes"
- "Analyze my recent workout for training zones and effort distribution"
- "What are my personal records and how do they compare to last year?"`,
  async () => {
    const account = await api.accounts.getAccountByProvider("strava");

    if (!account) {
      throw new Error("No Strava account found. Please connect your Strava account first.");
    }

    // Get valid access token with automatic refresh using secure token manager
    const stravaApiHeaders = await StravaTokenManager.createApiHeaders(account.userId);

    return {
      [StravaTools.GetAthleteProfile]: stravaGetAthleteProfileToolConfigServer(stravaApiHeaders),
      [StravaTools.GetAthleteActivities]: stravaGetAthleteActivitiesToolConfigServer(stravaApiHeaders),
      [StravaTools.GetActivityDetails]: stravaGetActivityDetailsToolConfigServer(stravaApiHeaders),
      [StravaTools.GetAthleteStats]: stravaGetAthleteStatsToolConfigServer(stravaApiHeaders),
      [StravaTools.SearchSegments]: stravaSearchSegmentsToolConfigServer(stravaApiHeaders),
      [StravaTools.GetSegmentDetails]: stravaGetSegmentDetailsToolConfigServer(stravaApiHeaders),
      [StravaTools.GetSegmentLeaderboard]: stravaGetSegmentLeaderboardToolConfigServer(stravaApiHeaders),
      [StravaTools.GetRoutes]: stravaGetRoutesToolConfigServer(stravaApiHeaders),
      [StravaTools.GetAthleteZones]: stravaGetAthleteZonesToolConfigServer(stravaApiHeaders),
    };
  },
); 