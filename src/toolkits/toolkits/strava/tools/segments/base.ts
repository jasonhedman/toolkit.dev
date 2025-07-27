import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const searchSegmentsTool = createBaseTool({
  description:
    "Search for segments using geographic bounds or activity type filters",
  inputSchema: z.object({
    bounds: z.string().describe("Comma-separated list of lat/lng coordinates: sw_lat,sw_lng,ne_lat,ne_lng (e.g., '37.821362,-122.505373,37.842038,-122.465977')"),
    activity_type: z.enum(["running", "riding"]).optional().describe("Activity type to filter segments"),
  }),
  outputSchema: z.object({
    segments: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        activity_type: z.string(),
        distance: z.number(),
        average_grade: z.number(),
        maximum_grade: z.number(),
        elevation_high: z.number(),
        elevation_low: z.number(),
        start_latlng: z.array(z.number()).nullable(),
        end_latlng: z.array(z.number()).nullable(),
        climb_category: z.number(),
        city: z.string().nullable(),
        state: z.string().nullable(),
        country: z.string().nullable(),
        private: z.boolean(),
        hazardous: z.boolean(),
        starred: z.boolean(),
      })
    ),
  }),
});

export const getSegmentDetailsTool = createBaseTool({
  description:
    "Get detailed information about a specific segment including its location, difficulty, and statistics",
  inputSchema: z.object({
    id: z.number().describe("The segment ID"),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
    activity_type: z.string(),
    distance: z.number(),
    average_grade: z.number(),
    maximum_grade: z.number(),
    elevation_high: z.number(),
    elevation_low: z.number(),
    start_latlng: z.array(z.number()).nullable(),
    end_latlng: z.array(z.number()).nullable(),
    elevation_profile: z.string().nullable(),
    climb_category: z.number(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    private: z.boolean(),
    hazardous: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    total_elevation_gain: z.number(),
    effort_count: z.number(),
    athlete_count: z.number(),
    star_count: z.number(),
    athlete_segment_stats: z.object({
      pr_elapsed_time: z.number().nullable(),
      pr_date: z.string().nullable(),
      effort_count: z.number(),
    }),
  }),
});

export const getSegmentLeaderboardTool = createBaseTool({
  description:
    "Get the leaderboard for a specific segment with filtering options",
  inputSchema: z.object({
    id: z.number().describe("The segment ID"),
    gender: z.enum(["M", "F"]).optional().describe("Filter by gender"),
    age_group: z.enum(["0_19", "20_24", "25_34", "35_44", "45_54", "55_64", "65_plus"]).optional().describe("Filter by age group"),
    weight_class: z.enum(["0_124", "125_149", "150_164", "165_179", "180_199", "200_224", "225_plus"]).optional().describe("Filter by weight class (lbs)"),
    following: z.boolean().optional().describe("Filter to only athletes the authenticated user follows"),
    club_id: z.number().optional().describe("Filter to only members of the specified club"),
    date_range: z.enum(["this_year", "this_month", "this_week", "today"]).optional().describe("Filter by date range"),
    context_entries: z.number().optional().describe("Number of entries to return around the authenticated athlete"),
    page: z.number().optional().describe("Page number for pagination"),
    per_page: z.number().optional().describe("Number of entries per page, max 200"),
  }),
  outputSchema: z.object({
    effort_count: z.number(),
    entry_count: z.number(),
    entries: z.array(
      z.object({
        athlete_name: z.string(),
        athlete_id: z.number(),
        athlete_gender: z.string(),
        athlete_profile: z.string(),
        rank: z.number(),
        elapsed_time: z.number(),
        moving_time: z.number(),
        start_date: z.string(),
        start_date_local: z.string(),
        activity_id: z.number(),
      })
    ),
  }),
}); 