import { WebClient } from "@slack/web-api";
import type { searchMessagesTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const searchMessagesToolConfigServer = (
    client: WebClient,
): ServerToolConfig<
    typeof searchMessagesTool.inputSchema.shape,
    typeof searchMessagesTool.outputSchema.shape
> => {
    return {
        callback: async ({ query, count, sort }) => {
            const result = await client.search.messages({
                query,
                count: count || 20,
                sort: sort || "score",
            });

            return {
                messages:
                    result.messages?.matches?.map((match) => ({
                        type: match.type!,
                        text: match.text!,
                        user: match.user,
                        username: match.username,
                        ts: match.ts!,
                        channel: match.channel
                            ? {
                                id: match.channel.id!,
                                name: match.channel.name!,
                            }
                            : undefined,
                        permalink: match.permalink,
                    })) || [],
                total: result.messages?.total || 0,
            };
        },
    };
};
