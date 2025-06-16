import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getUserTimelineTool = createBaseTool({
  description:
    "Get the most recent tweets from a specific user's timeline. Returns tweets posted by the user, excluding retweets and replies by default.",
  inputSchema: z.object({
    user_identifier: z
      .string()
      .describe("Twitter username (without @) or user ID"),
    max_results: z
      .number()
      .min(5)
      .max(100)
      .default(10)
      .describe("Maximum number of tweets to return (5-100)"),
    exclude_replies: z
      .boolean()
      .default(true)
      .describe("Whether to exclude replies from the timeline"),
    exclude_retweets: z
      .boolean()
      .default(true)
      .describe("Whether to exclude retweets from the timeline"),
  }),
  outputSchema: z.object({
    tweets: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        created_at: z.string(),
        public_metrics: z.object({
          retweet_count: z.number(),
          like_count: z.number(),
          reply_count: z.number(),
          quote_count: z.number(),
        }),
        possibly_sensitive: z.boolean().optional(),
        conversation_id: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});
