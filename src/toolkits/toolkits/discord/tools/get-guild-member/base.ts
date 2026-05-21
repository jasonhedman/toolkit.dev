import { z } from "zod";

import { createBaseTool } from "@/toolkits/create-tool";

import type { RESTGetCurrentUserGuildMemberResult } from "discord-api-types/v10";

export const getGuildMemberTool = createBaseTool({
  description:
    "Get your Discord member profile for a specific server by guild ID",
  inputSchema: z.object({
    guildId: z.string().describe("Discord server/guild ID"),
  }),
  outputSchema: z.object({
    member: z.custom<RESTGetCurrentUserGuildMemberResult>(),
  }),
});
