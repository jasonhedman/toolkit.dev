import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getUserFollowingTool = createBaseTool({
  description:
    "Get a list of users that a specific user is following. Returns profiles of accounts they follow with basic information.",
  inputSchema: z.object({
    user_identifier: z
      .string()
      .describe("Twitter username (without @) or user ID"),
    max_results: z
      .number()
      .min(1)
      .max(1000)
      .default(100)
      .describe("Maximum number of following users to return (1-1000)"),
  }),
  outputSchema: z.object({
    following: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        name: z.string(),
        description: z.string().optional(),
        verified: z.boolean().optional(),
        public_metrics: z.object({
          followers_count: z.number(),
          following_count: z.number(),
        }),
        profile_image_url: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});
