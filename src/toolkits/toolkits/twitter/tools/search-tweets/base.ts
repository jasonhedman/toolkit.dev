import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const searchTweetsTool = createBaseTool({
    description:
        "Search for tweets using keywords, hashtags, or advanced queries. Rate limit: 450 requests per 15 minutes. Supports operators like 'from:', '#hashtag', 'lang:', etc.",
    inputSchema: z.object({
        query: z
            .string()
            .describe(
                "Search query. Supports operators: from:username, to:username, #hashtag, lang:en, -filter:retweets, etc.",
            ),
        max_results: z
            .number()
            .min(10)
            .max(100)
            .default(10)
            .describe("Number of tweets to return (10-100)"),
        start_time: z
            .string()
            .optional()
            .describe("Start time in ISO 8601 format (e.g., 2024-01-01T00:00:00Z)"),
        end_time: z
            .string()
            .optional()
            .describe("End time in ISO 8601 format"),
        sort_order: z
            .enum(["recency", "relevancy"])
            .optional()
            .describe("Sort order for results"),
    }),
    outputSchema: z.object({
        tweets: z.array(
            z.object({
                id: z.string(),
                text: z.string(),
                author_id: z.string(),
                created_at: z.string(),
                public_metrics: z
                    .object({
                        retweet_count: z.number(),
                        reply_count: z.number(),
                        like_count: z.number(),
                        quote_count: z.number(),
                        bookmark_count: z.number().optional(),
                        impression_count: z.number().optional(),
                    })
                    .optional(),
                entities: z
                    .object({
                        hashtags: z.array(z.object({ tag: z.string() })).optional(),
                        mentions: z
                            .array(z.object({ username: z.string() }))
                            .optional(),
                        urls: z
                            .array(
                                z.object({
                                    url: z.string(),
                                    expanded_url: z.string().optional(),
                                }),
                            )
                            .optional(),
                    })
                    .optional(),
            }),
        ),
        meta: z.object({
            result_count: z.number(),
            next_token: z.string().optional(),
        }),
        rate_limit: z
            .object({
                limit: z.number(),
                remaining: z.number(),
                reset: z.number(),
            })
            .optional(),
    }),
});
