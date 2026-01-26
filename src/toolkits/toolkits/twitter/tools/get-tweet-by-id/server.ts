import type { TwitterApi } from "twitter-api-v2";
import type { getTweetByIdTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const getTweetByIdToolConfigServer = (
    client: TwitterApi,
): ServerToolConfig<
    typeof getTweetByIdTool.inputSchema.shape,
    typeof getTweetByIdTool.outputSchema.shape
> => {
    return {
        callback: async ({ tweet_id }) => {
            const response = await client.v2.singleTweet(tweet_id, {
                "tweet.fields": [
                    "created_at",
                    "public_metrics",
                    "entities",
                    "author_id",
                    "referenced_tweets",
                ],
            });

            const rateLimit = (response as any).rateLimit
                ? {
                    limit: (response as any).rateLimit.limit,
                    remaining: (response as any).rateLimit.remaining,
                    reset: (response as any).rateLimit.reset,
                }
                : undefined;

            return {
                tweet: {
                    id: response.data.id,
                    text: response.data.text,
                    author_id: response.data.author_id!,
                    created_at: response.data.created_at!,
                    public_metrics: response.data.public_metrics,
                    entities: response.data.entities,
                    referenced_tweets: response.data.referenced_tweets,
                },
                rate_limit: rateLimit,
            };
        },
    };
};
