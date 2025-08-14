import type { ServerToolConfig } from "@/toolkits/types";
import type { getUserProfileTool } from "./base";
import type { TwitterApi } from "twitter-api-v2";

export const getUserProfileToolConfigServer = (
  client: TwitterApi,
): ServerToolConfig<
  typeof getUserProfileTool.inputSchema.shape,
  typeof getUserProfileTool.outputSchema.shape
> => {
  return {
    callback: async (args: { username: string }) => {
      const { username } = args;

      const user = await client.v2.userByUsername(username, {
        "user.fields": [
          "description",
          "location",
          "url",
          "public_metrics",
          "verified_type",
          "profile_image_url",
          "created_at",
        ],
      });

      if (!user.data) {
        throw new Error(`User ${username} not found`);
      }

      return {
        user,
      };
    },
  };
};
