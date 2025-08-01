import { type listServersTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";
import type { APIGuild } from "discord-api-types/v10";
import type { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

export const listServersToolConfigServer = (
  rest: REST,
): ServerToolConfig<
  typeof listServersTool.inputSchema.shape,
  typeof listServersTool.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const guilds: APIGuild[] = (await rest.get(
          Routes.userGuilds(),
        )) as APIGuild[];

        return {
          success: true,
          servers: guilds.map((guild: APIGuild) => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
              : undefined,
            memberCount: guild.approximate_member_count ?? undefined,
            owner: guild.owner ?? false,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    message: (result) => {
      if (result.success && result.servers) {
        return `📋 Found ${result.servers.length} Discord servers you're a member of`;
      } else {
        return `❌ Failed to load servers: ${result.error}`;
      }
    },
  };
};
