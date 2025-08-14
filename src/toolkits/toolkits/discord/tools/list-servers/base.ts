import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { APIGuild } from "discord-api-types/v10";

export const listServersTool = createBaseTool({
  description: "List all Discord servers you are a member of",
  inputSchema: z.object({
    // No input needed - uses authenticated user's servers
  }),
  outputSchema: z.object({
    servers: z.custom<APIGuild[]>(),
  }),
});
