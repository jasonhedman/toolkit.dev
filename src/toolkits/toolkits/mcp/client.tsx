import { Plug } from "lucide-react";

import { createClientToolkit } from "@/toolkits/create-toolkit";
import { ToolkitGroups } from "@/toolkits/types";

import { baseMcpToolkitConfig } from "./base";
import { McpForm } from "./form";

export const mcpClientToolkit = createClientToolkit(
  baseMcpToolkitConfig,
  {
    name: "MCP",
    description: "Connect to any hosted MCP server",
    icon: Plug,
    form: McpForm,
    type: ToolkitGroups.DataSource,
    envVars: [],
  },
  {},
);
