import { TwitterApi } from "twitter-api-v2";
import { getUserFollowersTool } from "./base";

export const getUserFollowersServer = (readOnlyClient: any) => ({
  ...getUserFollowersTool,
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

      const followersResult = await readOnlyClient.v2.followers(userId, {
        max_results: args.max_results,
        "user.fields": [
          "description",
          "verified",
          "public_metrics",
          "profile_image_url",
        ],
      });

      const followers = followersResult.data?.data ?? [];

      return {
        followers: followers.map((user: any) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          description: user.description,
          verified: user.verified,
          public_metrics: {
            followers_count: user.public_metrics?.followers_count ?? 0,
            following_count: user.public_metrics?.following_count ?? 0,
          },
          profile_image_url: user.profile_image_url,
        })),
        next_token: followersResult.meta?.next_token,
      };
    } catch (error) {
      throw new Error(
        `Failed to get followers: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: (result: any) => `Retrieved ${result.followers.length} followers`,
});
