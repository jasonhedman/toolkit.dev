import { type getUserInfoTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";
import type { APIUser } from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import type { REST } from "@discordjs/rest";

export const getUserInfoToolConfigServer = (
  rest: REST,
): ServerToolConfig<
  typeof getUserInfoTool.inputSchema.shape,
  typeof getUserInfoTool.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const user: APIUser = (await rest.get(Routes.user("@me"))) as APIUser;

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator ?? "0",
            avatar: user.avatar
              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
              : undefined,
            email: user.email ?? undefined,
            verified: user.verified ?? false,
            nitro: user.premium_type ? true : false,
            createdAt: new Date(
              parseInt(user.id) / 4194304 + 1420070400000,
            ).toISOString(),
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    message: (result) => {
      if (result.success && result.user) {
        return `👤 Retrieved profile for ${result.user.username}`;
      } else {
        return `❌ Failed to load profile: ${result.error}`;
      }
    },
  };
};
