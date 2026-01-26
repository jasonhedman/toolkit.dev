import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getTweetByIdTool = createBaseTool({
    description:
        "Get detailed information about a specific tweet by ID. Rate limit: 900 requests per 15 minutes.",
    inputSchema: z.object({
        tweet_id: z.string().describe("ID of the tweet to retrieve"),
    }),
    outputSchema: z.object({
        tweet: z.object({
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
                    mentions: z.array(z.object({ username: z.string() })).optional(),
                    urls: z
                        .array(
                            z.object({
                                url: z.string(),
                                expanded_url: z.string().optional(),
                                display_url: z.string().optional(),
                            }),
                        )
                        .optional(),
                })
                .optional(),
            referenced_tweets: z
                .array(
                    z.object({
                        type: z.enum(["retweeted", "quoted", "replied_to"]),
                        id: z.string(),
                    }),
                )
                .optional(),
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
