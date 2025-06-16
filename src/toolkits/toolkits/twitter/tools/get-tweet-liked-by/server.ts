import { TwitterApi } from "twitter-api-v2";
import { getTweetLikedByTool } from "./base";

export const getTweetLikedByServer = (readOnlyClient: any) => ({
  ...getTweetLikedByTool,
  callback: async (args: any) => {
    try {
      const likesResult = await readOnlyClient.v2.tweetLikedBy(args.tweet_id, {
        max_results: args.max_results,
        "user.fields": [
          "description",
          "verified",
          "public_metrics",
          "profile_image_url",
        ],
      });

      const users = likesResult.data?.data ?? [];

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
        next_token: likesResult.meta?.next_token,
      };
    } catch (error) {
      throw new Error(
        `Failed to get users who liked tweet: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: (result: any) =>
    `Retrieved ${result.users.length} users who liked the tweet`,
});
