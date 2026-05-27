import type { ServerToolConfig } from "@/toolkits/types";
import type { baseCallMcpTool } from "./base";
import type { createMcpClientConfig } from "../../transport";
import { withMcpClient } from "../../transport";

export const mcpCallToolConfigServer = (
  config: ReturnType<typeof createMcpClientConfig>,
): ServerToolConfig<
  typeof baseCallMcpTool.inputSchema.shape,
  typeof baseCallMcpTool.outputSchema.shape
> => ({
  callback: async ({ toolName, arguments: toolArguments }) => {
    return await withMcpClient(config, async (client) => {
      const response = await client.callTool({
        name: toolName,
        arguments: toolArguments,
      });

      return {
        content: response.content,
        structuredContent: response.structuredContent,
        isError:
          typeof response.isError === "boolean" ? response.isError : undefined,
      };
    });
  },
  message:
    "The user is shown the MCP tool result. Use the structured result to answer their request.",
});
