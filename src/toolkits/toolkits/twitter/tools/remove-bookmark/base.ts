import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const removeBookmarkTool = createBaseTool({
    description:
        "Remove a tweet from your bookmarks. Rate limit: 50 requests per 15 minutes. Requires bookmark.write scope.",
    inputSchema: z.object({
        tweet_id: z.string().describe("ID of the tweet to remove from bookmarks"),
    }),
    outputSchema: z.object({
        removed: z.boolean(),
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
