import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getBookmarksTool = createBaseTool({
    description:
        "Retrieve your bookmarked tweets. Rate limit: 180 requests per 15 minutes. Requires bookmark.read scope.",
    inputSchema: z.object({
        max_results: z
            .number()
            .min(1)
            .max(100)
            .default(10)
            .describe("Number of bookmarks to retrieve (1-100)"),
    }),
    outputSchema: z.object({
        bookmarks: z.array(
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
