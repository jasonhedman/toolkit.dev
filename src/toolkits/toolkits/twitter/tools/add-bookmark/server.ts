import type { TwitterApi } from "twitter-api-v2";
import type { addBookmarkTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const addBookmarkToolConfigServer = (
    client: TwitterApi,
): ServerToolConfig<
    typeof addBookmarkTool.inputSchema.shape,
    typeof addBookmarkTool.outputSchema.shape
> => {
    return {
        callback: async ({ tweet_id }) => {
            const response = await client.v2.bookmark(tweet_id);

            // Rate limit info may not be available on all responses
            const rateLimit = (response as any).rateLimit
                ? {
                    limit: (response as any).rateLimit.limit,
                    remaining: (response as any).rateLimit.remaining,
                    reset: (response as any).rateLimit.reset,
                }
                : undefined;

            return {
                bookmarked: response.data.bookmarked,
                tweet_id,
                rate_limit: rateLimit,
            };
        },
    };
};
