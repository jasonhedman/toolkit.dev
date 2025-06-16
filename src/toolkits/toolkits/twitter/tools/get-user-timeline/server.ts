import { TwitterApi } from "twitter-api-v2";
import { getUserTimelineTool } from "./base";

export const getUserTimelineServer = (readOnlyClient: any) => ({
  ...getUserTimelineTool,
  callback: async (args: any) => {
    try {
      const isUserId = /^\d+$/.test(args.user_identifier);
      let userId = args.user_identifier;

      if (!isUserId) {
        const userResult = await readOnlyClient.v2.userByUsername(
          args.user_identifier,
        );
        userId = userResult.data.id;
      }

      const timelineResult = await readOnlyClient.v2.userTimeline(userId, {
        max_results: args.max_results,
        exclude: [
          ...(args.exclude_replies ? ["replies"] : []),
          ...(args.exclude_retweets ? ["retweets"] : []),
        ] as ("replies" | "retweets")[],
        "tweet.fields": [
          "created_at",
          "public_metrics",
          "possibly_sensitive",
          "conversation_id",
        ],
      });

      const tweets = timelineResult.data?.data ?? [];

      return {
        tweets: tweets.map((tweet: any) => ({
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at ?? "",
          public_metrics: tweet.public_metrics ?? {
            retweet_count: 0,
            like_count: 0,
            reply_count: 0,
            quote_count: 0,
          },
          possibly_sensitive: tweet.possibly_sensitive,
          conversation_id: tweet.conversation_id,
        })),
        next_token: timelineResult.meta?.next_token,
      };
    } catch (error) {
      throw new Error(
        `Failed to get user timeline: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: (result: any) =>
    `Retrieved ${result.tweets.length} tweets from timeline`,
});
