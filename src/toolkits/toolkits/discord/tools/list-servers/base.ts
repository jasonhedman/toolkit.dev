import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const listServersTool = createBaseTool({
  description: "List all Discord servers you are a member of",
  inputSchema: z.object({
    // No input needed - uses authenticated user's servers
  }),
  outputSchema: z.object({
    success: z.boolean(),
    servers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          icon: z.string().optional(),
          memberCount: z.number().optional(),
          owner: z.boolean().optional(),
        }),
      )
      .optional(),
    error: z.string().optional(),
  }),
});
