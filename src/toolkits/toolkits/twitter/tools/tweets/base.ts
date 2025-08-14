import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { TweetUserTimelineV2Paginator } from "twitter-api-v2";

export const getLatestTweetsTool = createBaseTool({
  description: "Get the latest tweets from a Twitter user (up to 100 tweets)",
  inputSchema: z.object({
    username: z
      .string()
      .describe(
        "Twitter username (without @ symbol). Example: 'elonmusk', 'twitter'",
      ),
    max_results: z
      .number()
      .min(1)
      .max(100)
      .describe("Number of tweets to retrieve (max 100, default 10)"),
    exclude_retweets: z.boolean().describe("Exclude retweets from results"),
    exclude_replies: z.boolean().describe("Exclude replies from results"),
  }),
  outputSchema: z.object({
    tweets: z.custom<TweetUserTimelineV2Paginator>(),
  }),
});
