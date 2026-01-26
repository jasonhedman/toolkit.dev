import type { TwitterApi } from "twitter-api-v2";
import type { removeBookmarkTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const removeBookmarkToolConfigServer = (
    client: TwitterApi,
): ServerToolConfig<
    typeof removeBookmarkTool.inputSchema.shape,
    typeof removeBookmarkTool.outputSchema.shape
> => {
    return {
        callback: async ({ tweet_id }) => {
            const response = await client.v2.deleteBookmark(tweet_id);

            const rateLimit = (response as any).rateLimit
                ? {
                    limit: (response as any).rateLimit.limit,
                    remaining: (response as any).rateLimit.remaining,
                    reset: (response as any).rateLimit.reset,
                }
                : undefined;

            return {
                removed: response.data.bookmarked === false,
                tweet_id,
                rate_limit: rateLimit,
            };
        },
    };
};
