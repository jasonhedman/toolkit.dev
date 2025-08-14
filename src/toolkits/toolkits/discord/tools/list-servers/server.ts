import { Routes } from "discord-api-types/v10";

import type { listServersTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";
import type { APIGuild } from "discord-api-types/v10";
import type { REST } from "@discordjs/rest";

export const listServersToolConfigServer = (
  rest: REST,
): ServerToolConfig<
  typeof listServersTool.inputSchema.shape,
  typeof listServersTool.outputSchema.shape
> => {
  return {
    callback: async () => {
      return {
        servers: (await rest.get(Routes.userGuilds())) as APIGuild[],
      };
    },
  };
};
