import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const listChannelsTool = createBaseTool({
    description: "List all channels in your Slack workspace",
    inputSchema: z.object({
        types: z
            .string()
            .optional()
            .describe(
                "Comma-separated list of channel types (public_channel, private_channel, mpim, im). Defaults to public_channel",
            ),
        limit: z
            .number()
            .optional()
            .describe("Maximum number of channels to return. Defaults to 100"),
    }),
    outputSchema: z.object({
        channels: z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                is_channel: z.boolean().optional(),
                is_private: z.boolean().optional(),
                is_member: z.boolean().optional(),
                num_members: z.number().optional(),
                topic: z
                    .object({
                        value: z.string(),
                    })
                    .optional(),
                purpose: z
                    .object({
                        value: z.string(),
                    })
                    .optional(),
            }),
        ),
    }),
});
