import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const searchTweetsTool = createBaseTool({
  description:
    "Search for tweets published in the last 7 days. Returns tweets matching your search query with essential information like text, author, metrics, and timestamps.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query using Twitter search operators. Examples: 'from:twitter', 'to:elonmusk', '#AI', 'has:images', 'is:retweet', 'lang:en', 'since:2023-01-01', 'until:2023-12-31', 'min_retweets:100', 'min_faves:500'",
      ),
    max_results: z
      .number()
      .min(10)
      .max(100)
      .default(10)
      .describe("Maximum number of results to return (10-100)"),
    sort_order: z
      .enum(["recency", "relevancy"])
      .default("recency")
      .describe(
        "Sort order: 'recency' for newest first, 'relevancy' for most relevant",
      ),
  }),
  outputSchema: z.object({
    tweets: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        author_username: z.string(),
        author_name: z.string(),
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
