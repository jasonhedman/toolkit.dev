import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getUserInfoTool = createBaseTool({
    description: "Get information about the authenticated Slack user",
    inputSchema: z.object({
        // No input needed - uses authenticated user
    }),
    outputSchema: z.object({
        user: z.object({
            id: z.string(),
            name: z.string(),
            real_name: z.string().optional(),
            email: z.string().optional(),
            is_admin: z.boolean().optional(),
            is_owner: z.boolean().optional(),
            is_bot: z.boolean().optional(),
            profile: z
                .object({
                    display_name: z.string().optional(),
                    status_text: z.string().optional(),
                    status_emoji: z.string().optional(),
                    image_192: z.string().optional(),
                })
                .optional(),
        }),
    }),
});
