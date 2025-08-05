import { z } from "zod";

import { createBaseTool } from "@/toolkits/create-tool";

import type { APIUser } from "discord-api-types/v10";

export const getUserInfoTool = createBaseTool({
  description: "Get information about your Discord account",
  inputSchema: z.object({
    // No input needed - uses authenticated user
  }),
  outputSchema: z.object({
    user: z.custom<APIUser>(),
  }),
});
