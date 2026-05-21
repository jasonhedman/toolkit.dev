import { Routes } from "discord-api-types/v10";

import { type getGuildMemberTool } from "./base";

import type { ServerToolConfig } from "@/toolkits/types";
import type { RESTGetCurrentUserGuildMemberResult } from "discord-api-types/v10";
import type { REST } from "@discordjs/rest";

export const getGuildMemberToolConfigServer = (
  rest: REST,
): ServerToolConfig<
  typeof getGuildMemberTool.inputSchema.shape,
  typeof getGuildMemberTool.outputSchema.shape
> => {
  return {
    callback: async ({ guildId }) => {
      return {
        member: (await rest.get(
          Routes.userGuildMember(guildId),
        )) as RESTGetCurrentUserGuildMemberResult,
      };
    },
  };
};
