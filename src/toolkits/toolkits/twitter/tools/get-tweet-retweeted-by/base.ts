import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getTweetRetweetedByTool = createBaseTool({
  description:
    "Get a list of users who have retweeted a specific tweet. Returns user profiles of those who retweeted the tweet.",
  inputSchema: z.object({
    tweet_id: z.string().describe("The unique identifier of the tweet"),
    max_results: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe("Maximum number of users to return (1-100)"),
  }),
  outputSchema: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        name: z.string(),
        description: z.string().optional(),
        verified: z.boolean().optional(),
        public_metrics: z.object({
          followers_count: z.number(),
          following_count: z.number(),
          tweet_count: z.number(),
        }),
        profile_image_url: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});
