import { TwitterApi } from "twitter-api-v2";
import { getUserFollowingTool } from "./base";

export const getUserFollowingServer = (readOnlyClient: any) => ({
  ...getUserFollowingTool,
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

      const followingResult = await readOnlyClient.v2.following(userId, {
        max_results: args.max_results,
        "user.fields": [
          "description",
          "verified",
          "public_metrics",
          "profile_image_url",
        ],
      });

      const following = followingResult.data?.data ?? [];

      return {
        following: following.map((user: any) => ({
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
        next_token: followingResult.meta?.next_token,
      };
    } catch (error) {
      throw new Error(
        `Failed to get following: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: (result: any) => `Retrieved ${result.following.length} following`,
});
