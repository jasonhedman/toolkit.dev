import { WebClient } from "@slack/web-api";
import type { listChannelsTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const listChannelsToolConfigServer = (
    client: WebClient,
): ServerToolConfig<
    typeof listChannelsTool.inputSchema.shape,
    typeof listChannelsTool.outputSchema.shape
> => {
    return {
        callback: async ({ types, limit }) => {
            const result = await client.conversations.list({
                types: types || "public_channel",
                limit: limit || 100,
            });

            return {
                channels:
                    result.channels?.map((channel) => ({
                        id: channel.id!,
                        name: channel.name!,
                        is_channel: channel.is_channel,
                        is_private: channel.is_private,
                        is_member: channel.is_member,
                        num_members: channel.num_members,
                        topic: channel.topic
                            ? { value: channel.topic.value || "" }
                            : undefined,
                        purpose: channel.purpose
                            ? { value: channel.purpose.value || "" }
                            : undefined,
                    })) || [],
            };
        },
    };
};
