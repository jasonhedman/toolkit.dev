import { WebClient } from "@slack/web-api";
import type { sendMessageTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";

export const sendMessageToolConfigServer = (
    client: WebClient,
): ServerToolConfig<
    typeof sendMessageTool.inputSchema.shape,
    typeof sendMessageTool.outputSchema.shape
> => {
    return {
        callback: async ({ channel, text, thread_ts }) => {
            const result = await client.chat.postMessage({
                channel,
                text,
                thread_ts,
            });

            return {
                ok: result.ok,
                channel: result.channel!,
                ts: result.ts!,
                message: {
                    text: result.message?.text || text,
                    user: result.message?.user,
                },
            };
        },
    };
};
