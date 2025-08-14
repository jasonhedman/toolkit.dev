import type { ServerToolConfig } from "@/toolkits/types";
import type { getLatestTweetsTool } from "./base";
import type { TwitterApi } from "twitter-api-v2";

export const getLatestTweetsToolConfigServer = (
  client: TwitterApi,
): ServerToolConfig<
  typeof getLatestTweetsTool.inputSchema.shape,
  typeof getLatestTweetsTool.outputSchema.shape
> => {
  return {
    callback: async (args: {
      username: string;
      max_results?: number;
      exclude_retweets?: boolean;
      exclude_replies?: boolean;
    }) => {
      const {
        username,
        max_results = 10,
        exclude_retweets = false,
        exclude_replies = false,
      } = args;

      // First get the user ID
      const user = await client.v2.userByUsername(username);
      if (!user.data) {
        throw new Error(`User ${username} not found`);
      }

      const userId = user.data.id;

      // Get tweets
      const tweets = await client.v2.userTimeline(userId, {
        max_results,
        "tweet.fields": [
          "created_at",
          "public_metrics",
          "entities",
          "referenced_tweets",
          "in_reply_to_user_id",
        ],
        exclude: [
          ...(exclude_retweets ? ["retweets" as const] : []),
          ...(exclude_replies ? ["replies" as const] : []),
        ],
      });

      return {
        tweets,
      };
    },
  };
};
