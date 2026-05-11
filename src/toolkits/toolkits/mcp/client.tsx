import { Cable } from "lucide-react";

import { createClientToolkit } from "@/toolkits/create-toolkit";
import { ToolkitGroups } from "@/toolkits/types";

import { baseMcpToolkitConfig } from "./base";
import { Form } from "./form";

export const mcpClientToolkit = createClientToolkit<
  string,
  typeof baseMcpToolkitConfig.parameters.shape
>(
  baseMcpToolkitConfig,
  {
    name: "Hosted MCP",
    description: "Connect tools from a hosted MCP server",
    icon: Cable,
    form: Form,
    type: ToolkitGroups.DataSource,
    envVars: [],
  },
  {},
);
