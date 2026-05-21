import { createServerToolkit } from "@/toolkits/create-toolkit";

import { baseMcpToolkitConfig } from "./base";

export const mcpToolkitServer = createServerToolkit(
  baseMcpToolkitConfig,
  `You have access to a user-configured hosted MCP server. The tools are discovered dynamically from the configured MCP URL. Use these tools when they match the user's request, and explain tool errors clearly if the remote MCP server rejects a call.`,
  async () => {
    return {};
  },
);
