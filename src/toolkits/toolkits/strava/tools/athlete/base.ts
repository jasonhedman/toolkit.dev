import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getAthleteProfileTool = createBaseTool({
  description:
    "Get the authenticated athlete's profile information including name, location, premium status, and gear",
  inputSchema: z.object({}),
  outputSchema: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    profile_medium: z.string(),
    profile: z.string(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    sex: z.string().nullable(),
    premium: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    follower_count: z.number(),
    friend_count: z.number(),
    athlete_type: z.number(),
    measurement_preference: z.string(),
    ftp: z.number().nullable(),
    weight: z.number().nullable(),
  }),
});

export const getAthleteStatsTool = createBaseTool({
  description:
    "Get athlete's activity statistics including recent (4 weeks), year-to-date, and all-time totals for different activity types",
  inputSchema: z.object({}),
  outputSchema: z.object({
    recent_ride_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
      achievement_count: z.number(),
    }),
    recent_run_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
      achievement_count: z.number(),
    }),
    recent_swim_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
      achievement_count: z.number(),
    }),
    ytd_ride_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
    }),
    ytd_run_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
    }),
    ytd_swim_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
    }),
    all_ride_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
    }),
    all_run_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
    }),
    all_swim_totals: z.object({
      count: z.number(),
      distance: z.number(),
      moving_time: z.number(),
      elapsed_time: z.number(),
      elevation_gain: z.number(),
    }),
  }),
});

export const getAthleteZonesTool = createBaseTool({
  description:
    "Get the athlete's heart rate and power zones for training analysis",
  inputSchema: z.object({}),
  outputSchema: z.object({
    heart_rate: z.object({
      custom_zones: z.boolean(),
      zones: z.array(
        z.object({
          min: z.number(),
          max: z.number(),
        })
      ),
    }).optional(),
    power: z.object({
      zones: z.array(
        z.object({
          min: z.number(),
          max: z.number(),
        })
      ),
    }).optional(),
  }),
}); 