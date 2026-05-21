import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

import type { TweetV2SingleResult } from "twitter-api-v2";

export const getTweetTool = createBaseTool({
  description: "Get a single tweet by its tweet ID",
  inputSchema: z.object({
    tweetId: z
      .string()
      .describe("Tweet ID from a Twitter/X post URL or copied tweet ID"),
  }),
  outputSchema: z.object({
    tweet: z.custom<TweetV2SingleResult>(),
  }),
});
