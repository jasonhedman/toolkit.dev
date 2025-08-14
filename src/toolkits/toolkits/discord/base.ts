import { z } from "zod";

import { DiscordTools, listServersTool, getUserInfoTool } from "./tools";

import type { ToolkitConfig } from "@/toolkits/types";

export const discordParameters = z.object({
  // No parameters needed for user-focused tools
});

export const baseDiscordToolkitConfig: ToolkitConfig<
  DiscordTools,
  typeof discordParameters.shape
> = {
  tools: {
    [DiscordTools.ListServers]: listServersTool,
    [DiscordTools.GetUserInfo]: getUserInfoTool,
  },
  parameters: discordParameters,
};
