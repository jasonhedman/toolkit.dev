import { TwitterApi } from "twitter-api-v2";
import { getTweetRetweetedByTool } from "./base";

export const getTweetRetweetedByServer = (readOnlyClient: any) => ({
  ...getTweetRetweetedByTool,
  callback: async (args: any) => {
    try {
      const retweetsResult = await readOnlyClient.v2.tweetRetweetedBy(
        args.tweet_id,
        {
          max_results: args.max_results,
          "user.fields": [
            "description",
            "verified",
            "public_metrics",
            "profile_image_url",
          ],
        },
      );

      const users = retweetsResult.data?.data ?? [];

      return {
        users: users.map((user: any) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          description: user.description,
          verified: user.verified,
          public_metrics: {
            followers_count: user.public_metrics?.followers_count ?? 0,
            following_count: user.public_metrics?.following_count ?? 0,
            tweet_count: user.public_metrics?.tweet_count ?? 0,
          },
          profile_image_url: user.profile_image_url,
        })),
        next_token: retweetsResult.meta?.next_token,
      };
    } catch (error) {
      throw new Error(
        `Failed to get users who retweeted: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: (result: any) =>
    `Retrieved ${result.users.length} users who retweeted`,
});
