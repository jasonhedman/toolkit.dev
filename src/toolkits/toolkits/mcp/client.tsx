import { Network } from "lucide-react";

import { createClientToolkit } from "@/toolkits/create-toolkit";
import { ToolkitGroups } from "@/toolkits/types";
import { baseMcpToolkitConfig } from "./base";
import { McpForm } from "./form";
import { mcpCallToolConfigClient } from "./tools/call_tool/client";
import { mcpListToolsToolConfigClient } from "./tools/list_tools/client";
import { McpTools } from "./tools/tools";

export const mcpClientToolkit = createClientToolkit(
  baseMcpToolkitConfig,
  {
    name: "MCP Server",
    description: "Connect to a hosted MCP server by URL",
    icon: Network,
    form: McpForm,
    type: ToolkitGroups.DataSource,
    envVars: [],
  },
  {
    [McpTools.ListTools]: mcpListToolsToolConfigClient,
    [McpTools.CallTool]: mcpCallToolConfigClient,
  },
);
