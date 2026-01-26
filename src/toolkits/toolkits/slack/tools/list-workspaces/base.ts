import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const listWorkspacesTool = createBaseTool({
    description: "List all Slack workspaces (teams) the user has access to",
    inputSchema: z.object({
        // No input needed - uses authenticated user's workspaces
    }),
    outputSchema: z.object({
        team: z.object({
            id: z.string(),
            name: z.string(),
            domain: z.string().optional(),
            email_domain: z.string().optional(),
            icon: z
                .object({
                    image_default: z.boolean().optional(),
                    image_68: z.string().optional(),
                    image_88: z.string().optional(),
                    image_132: z.string().optional(),
                })
                .optional(),
        }),
    }),
});
