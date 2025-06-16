import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { TweetV2, UserV2 } from "twitter-api-v2";

export const getTweetTool = createBaseTool({
  description:
    "Get detailed information about a specific tweet by its ID. Returns tweet content, author information, and engagement metrics.",
  inputSchema: z.object({
    tweet_id: z
      .string()
      .describe(
        "The unique identifier of the tweet (e.g., '1234567890123456789')",
      ),
  }),
  outputSchema: z.object({
    tweet: z.custom<TweetV2>(),
    author: z.custom<UserV2>(),
  }),
});
