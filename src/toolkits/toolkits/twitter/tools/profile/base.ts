import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { UserV2Result } from "twitter-api-v2";

export const getUserProfileTool = createBaseTool({
  description: "Get Twitter user profile information by username",
  inputSchema: z.object({
    username: z
      .string()
      .describe(
        "Twitter username (without @ symbol). Example: 'elonmusk', 'twitter'",
      ),
  }),
  outputSchema: z.object({
    user: z.custom<UserV2Result>(),
  }),
});
