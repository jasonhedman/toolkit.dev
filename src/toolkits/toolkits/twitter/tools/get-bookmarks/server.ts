import type { TwitterApi } from "twitter-api-v2";
import type { getBookmarksTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const getBookmarksToolConfigServer = (
    client: TwitterApi,
): ServerToolConfig<
    typeof getBookmarksTool.inputSchema.shape,
    typeof getBookmarksTool.outputSchema.shape
> => {
    return {
        callback: async ({ max_results }) => {
            const response = await client.v2.bookmarks({
                max_results: max_results || 10,
                "tweet.fields": ["created_at", "public_metrics", "author_id"],
            });

            const rateLimit = response.rateLimit
                ? {
                    limit: response.rateLimit.limit,
                    remaining: response.rateLimit.remaining,
                    reset: response.rateLimit.reset,
                }
                : undefined;

            return {
                bookmarks: response.data.data.map((tweet) => ({
                    id: tweet.id,
                    text: tweet.text,
                    author_id: tweet.author_id!,
                    created_at: tweet.created_at!,
                    public_metrics: tweet.public_metrics,
                })),
                meta: {
                    result_count: response.data.meta.result_count,
                    next_token: response.data.meta.next_token,
                },
                rate_limit: rateLimit,
            };
        },
    };
};
