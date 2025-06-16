import { TwitterApi } from "twitter-api-v2";
import { getUserTool } from "./base";

export const getUserServer = (readOnlyClient: any) => ({
  ...getUserTool,
  callback: async (args: any) => {
    try {
      const isUserId = /^\d+$/.test(args.user_identifier);
      const userResult = isUserId
        ? await readOnlyClient.v2.user(args.user_identifier, {
            "user.fields": [
              "created_at",
              "description",
              "location",
              "url",
              "verified",
              "profile_image_url",
              "public_metrics",
              "protected",
            ],
          })
        : await readOnlyClient.v2.userByUsername(args.user_identifier, {
            "user.fields": [
              "created_at",
              "description",
              "location",
              "url",
              "verified",
              "profile_image_url",
              "public_metrics",
              "protected",
            ],
          });

      const user = userResult.data;

      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          description: user.description,
          location: user.location,
          url: user.url,
          verified: user.verified,
          created_at: user.created_at ?? "",
          profile_image_url: user.profile_image_url,
          public_metrics: user.public_metrics ?? {
            followers_count: 0,
            following_count: 0,
            tweet_count: 0,
            listed_count: 0,
          },
          protected: user.protected,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get user: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: (result: any) => `Retrieved user: @${result.user.username}`,
});
