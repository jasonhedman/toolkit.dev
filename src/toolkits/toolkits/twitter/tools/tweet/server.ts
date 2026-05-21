import type { ServerToolConfig } from "@/toolkits/types";
import type { getTweetTool } from "./base";
import type { TwitterApi } from "twitter-api-v2";

export const getTweetToolConfigServer = (
  client: TwitterApi,
): ServerToolConfig<
  typeof getTweetTool.inputSchema.shape,
  typeof getTweetTool.outputSchema.shape
> => {
  return {
    callback: async ({ tweetId }) => {
      const tweet = await client.v2.singleTweet(tweetId, {
        "tweet.fields": [
          "author_id",
          "conversation_id",
          "created_at",
          "entities",
          "public_metrics",
          "referenced_tweets",
        ],
        expansions: ["author_id"],
        "user.fields": [
          "name",
          "profile_image_url",
          "username",
          "verified_type",
        ],
      });

      if (!tweet.data) {
        throw new Error(`Tweet ${tweetId} not found`);
      }

      return {
        tweet,
      };
    },
  };
};
