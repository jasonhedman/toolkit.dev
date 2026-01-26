import { WebClient } from "@slack/web-api";
import type { listWorkspacesTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const listWorkspacesToolConfigServer = (
    client: WebClient,
): ServerToolConfig<
    typeof listWorkspacesTool.inputSchema.shape,
    typeof listWorkspacesTool.outputSchema.shape
> => {
    return {
        callback: async () => {
            const result = await client.team.info();

            return {
                team: {
                    id: result.team!.id!,
                    name: result.team!.name!,
                    domain: result.team!.domain,
                    email_domain: result.team!.email_domain,
                    icon: result.team!.icon,
                },
            };
        },
    };
};
