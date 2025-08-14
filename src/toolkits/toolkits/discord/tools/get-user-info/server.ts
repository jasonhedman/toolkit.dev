import { Routes } from "discord-api-types/v10";

import type { getUserInfoTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";
import type { APIUser } from "discord-api-types/v10";
import type { REST } from "@discordjs/rest";

export const getUserInfoToolConfigServer = (
  rest: REST,
): ServerToolConfig<
  typeof getUserInfoTool.inputSchema.shape,
  typeof getUserInfoTool.outputSchema.shape
> => {
  return {
    callback: async () => {
      return {
        user: (await rest.get(Routes.user("@me"))) as APIUser,
      };
    },
  };
};
