import { z } from "zod";

import { createBaseTool } from "@/toolkits/create-tool";

export const baseListMcpToolsTool = createBaseTool({
  description: "List the tools exposed by the configured MCP server.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    tools: z.array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        inputSchema: z.unknown().optional(),
      }),
    ),
  }),
});
