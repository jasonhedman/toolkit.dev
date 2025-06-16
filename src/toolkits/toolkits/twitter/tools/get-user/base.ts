import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getUserTool = createBaseTool({
  description:
    "Get detailed information about a Twitter user by their username or user ID. Returns profile information, verification status, and follower metrics.",
  inputSchema: z.object({
    user_identifier: z
      .string()
      .describe(
        "Twitter username (without @) or user ID (e.g., 'elonmusk' or '44196397')",
      ),
  }),
  outputSchema: z.object({
    user: z.object({
      id: z.string(),
      username: z.string(),
      name: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      url: z.string().optional(),
      verified: z.boolean().optional(),
      created_at: z.string(),
      profile_image_url: z.string().optional(),
      public_metrics: z.object({
        followers_count: z.number(),
        following_count: z.number(),
        tweet_count: z.number(),
        listed_count: z.number(),
      }),
      protected: z.boolean().optional(),
    }),
  }),
});
