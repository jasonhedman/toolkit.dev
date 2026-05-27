import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseMcpToolkitConfig } from "./base";
import { mcpCallToolConfigServer } from "./tools/call_tool/server";
import { mcpListToolsToolConfigServer } from "./tools/list_tools/server";
import { McpTools } from "./tools/tools";
import { createMcpClientConfig } from "./transport";

export const mcpToolkitServer = createServerToolkit(
  baseMcpToolkitConfig,
  `You have access to a user-configured hosted MCP server. Use "List MCP tools" first to discover the server's available tools, then call "Call MCP tool" with the exact tool name and JSON arguments.`,
  async (params) => {
    const config = createMcpClientConfig(params);

    return {
      [McpTools.ListTools]: mcpListToolsToolConfigServer(config),
      [McpTools.CallTool]: mcpCallToolConfigServer(config),
    };
  },
);
