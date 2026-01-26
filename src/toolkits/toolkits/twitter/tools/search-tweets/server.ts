import type { TwitterApi } from "twitter-api-v2";
import type { searchTweetsTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const searchTweetsToolConfigServer = (
    client: TwitterApi,
): ServerToolConfig<
    typeof searchTweetsTool.inputSchema.shape,
    typeof searchTweetsTool.outputSchema.shape
> => {
    return {
        callback: async ({ query, max_results, start_time, end_time, sort_order }) => {
            const response = await client.v2.search(query, {
                max_results: max_results || 10,
                start_time,
                end_time,
                sort_order,
                "tweet.fields": [
                    "created_at",
                    "public_metrics",
                    "entities",
                    "author_id",
                ],
            });

            // Extract rate limit info from response
            const rateLimit = response.rateLimit
                ? {
                    limit: response.rateLimit.limit,
                    remaining: response.rateLimit.remaining,
                    reset: response.rateLimit.reset,
                }
                : undefined;

            return {
                tweets: response.data.data.map((tweet) => ({
                    id: tweet.id,
                    text: tweet.text,
                    author_id: tweet.author_id!,
                    created_at: tweet.created_at!,
                    public_metrics: tweet.public_metrics,
                    entities: tweet.entities,
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
