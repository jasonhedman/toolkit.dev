import { TwitterApi } from "twitter-api-v2";
import { searchUsersTool } from "./base";

export const searchUsersServer = (readOnlyClient: any) => ({
  ...searchUsersTool,
  callback: async (args: any) => {
    // Twitter API v2 doesn't have a direct user search endpoint
    throw new Error(
      "User search is not available in Twitter API v2. Consider using tweet search to find users by their tweets.",
    );
  },
  message: (result: any) => `Found ${result.users.length} users`,
});
