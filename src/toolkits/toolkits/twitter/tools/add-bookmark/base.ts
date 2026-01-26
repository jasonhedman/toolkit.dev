import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const addBookmarkTool = createBaseTool({
    description:
        "Bookmark a tweet for later reference. Rate limit: 50 requests per 15 minutes. Requires bookmark.write scope.",
    inputSchema: z.object({
        tweet_id: z.string().describe("ID of the tweet to bookmark"),
    }),
    outputSchema: z.object({
        bookmarked: z.boolean(),
        tweet_id: z.string(),
        rate_limit: z
            .object({
                limit: z.number(),
                remaining: z.number(),
                reset: z.number(),
            })
            .optional(),
    }),
});
