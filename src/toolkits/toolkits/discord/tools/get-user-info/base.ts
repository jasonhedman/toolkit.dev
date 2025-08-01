import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getUserInfoTool = createBaseTool({
  description: "Get information about your Discord account",
  inputSchema: z.object({
    // No input needed - uses authenticated user
  }),
  outputSchema: z.object({
    success: z.boolean(),
    user: z
      .object({
        id: z.string(),
        username: z.string(),
        discriminator: z.string().optional(),
        avatar: z.string().optional(),
        email: z.string().optional(),
        verified: z.boolean().optional(),
        nitro: z.boolean().optional(),
        createdAt: z.string().optional(),
      })
      .optional(),
    error: z.string().optional(),
  }),
});
