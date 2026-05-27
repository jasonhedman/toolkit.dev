import type { ServerToolConfig } from "@/toolkits/types";
import type { baseListMcpToolsTool } from "./base";
import type { createMcpClientConfig } from "../../transport";
import { withMcpClient } from "../../transport";

export const mcpListToolsToolConfigServer = (
  config: ReturnType<typeof createMcpClientConfig>,
): ServerToolConfig<
  typeof baseListMcpToolsTool.inputSchema.shape,
  typeof baseListMcpToolsTool.outputSchema.shape
> => ({
  callback: async () => {
    return await withMcpClient(config, async (client) => {
      const response = await client.listTools();

      return {
        tools: response.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });
  },
  message:
    "The user is shown the MCP server's tools. Use the exact tool names when calling one of them.",
});
