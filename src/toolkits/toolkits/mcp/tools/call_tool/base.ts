import { z } from "zod";

import { createBaseTool } from "@/toolkits/create-tool";

export const baseCallMcpTool = createBaseTool({
  description: "Call one tool exposed by the configured MCP server.",
  inputSchema: z.object({
    toolName: z.string().min(1),
    arguments: z.record(z.any()).default({}),
  }),
  outputSchema: z.object({
    content: z.unknown(),
    structuredContent: z.unknown().optional(),
    isError: z.boolean().optional(),
  }),
});
