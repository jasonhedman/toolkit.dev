import { WebClient } from "@slack/web-api";
import type { getUserInfoTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const getUserInfoToolConfigServer = (
    client: WebClient,
): ServerToolConfig<
    typeof getUserInfoTool.inputSchema.shape,
    typeof getUserInfoTool.outputSchema.shape
> => {
    return {
        callback: async () => {
            const authResult = await client.auth.test();
            const userId = authResult.user_id!;

            const userResult = await client.users.info({
                user: userId,
            });

            const user = userResult.user!;

            return {
                user: {
                    id: user.id!,
                    name: user.name!,
                    real_name: user.real_name,
                    email: user.profile?.email,
                    is_admin: user.is_admin,
                    is_owner: user.is_owner,
                    is_bot: user.is_bot,
                    profile: user.profile
                        ? {
                            display_name: user.profile.display_name,
                            status_text: user.profile.status_text,
                            status_emoji: user.profile.status_emoji,
                            image_192: user.profile.image_192,
                        }
                        : undefined,
                },
            };
        },
    };
};
