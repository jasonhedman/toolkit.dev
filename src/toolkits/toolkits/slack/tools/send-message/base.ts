import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const sendMessageTool = createBaseTool({
    description: "Send a message to a Slack channel",
    inputSchema: z.object({
        channel: z.string().describe("Channel ID to send the message to"),
        text: z.string().describe("Message text to send"),
        thread_ts: z
            .string()
            .optional()
            .describe("Thread timestamp to reply to (for threaded messages)"),
    }),
    outputSchema: z.object({
        ok: z.boolean(),
        channel: z.string(),
        ts: z.string().describe("Timestamp of the sent message"),
        message: z.object({
            text: z.string(),
            user: z.string().optional(),
        }),
    }),
});
