import { type TwitterApi } from "twitter-api-v2";
import { type getTweetTool } from "./base";
import { createServerTool } from "@/toolkits/create-tool";
import type { ServerToolConfig } from "@/toolkits/types";

export const getTweetServer = (
  readOnlyClient: TwitterApi,
): ServerToolConfig<
  typeof getTweetTool.inputSchema.shape,
  typeof getTweetTool.outputSchema.shape
> => ({
  callback: async ({ tweet_id }) => {
    try {
      const tweetResult = await readOnlyClient.v2.singleTweet(tweet_id, {
        "tweet.fields": [
          "created_at",
          "public_metrics",
          "possibly_sensitive",
          "conversation_id",
          "in_reply_to_user_id",
          "lang",
          "source",
          "author_id",
        ],
        "user.fields": ["username", "name", "verified"],
        expansions: ["author_id"],
      });

      const tweet = tweetResult.data;
      const author = tweetResult.includes?.users?.[0];

      return {
        author,
        tweet,
      };
    } catch (error) {
      throw new Error(
        `Failed to get tweet: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: "Retrieved tweet details",
});
