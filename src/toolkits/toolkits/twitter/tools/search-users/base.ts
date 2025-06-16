import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const searchUsersTool = createBaseTool({
  description:
    "Search for Twitter users by keywords, names, or other criteria. Returns a list of matching user profiles.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query for users. Examples: 'name:John Doe', 'bio:developer', 'location:\"San Francisco\"', 'followers:>1000', 'verified:true'",
      ),
    max_results: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe("Maximum number of users to return (1-100)"),
  }),
  outputSchema: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        name: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        verified: z.boolean().optional(),
        public_metrics: z.object({
          followers_count: z.number(),
          following_count: z.number(),
          tweet_count: z.number(),
        }),
        profile_image_url: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});
