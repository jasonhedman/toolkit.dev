import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { baseCallMcpTool } from "./tools/call_tool/base";
import { baseListMcpToolsTool } from "./tools/list_tools/base";
import { McpTools } from "./tools/tools";

export const mcpParameters = z.object({
  url: z.string().url(),
  transport: z.enum(["http", "sse"]).default("http"),
  headers: z
    .string()
    .optional()
    .describe("Optional JSON object of HTTP headers for the MCP server"),
});

export const baseMcpToolkitConfig: ToolkitConfig<
  McpTools,
  typeof mcpParameters.shape
> = {
  tools: {
    [McpTools.ListTools]: baseListMcpToolsTool,
    [McpTools.CallTool]: baseCallMcpTool,
  },
  parameters: mcpParameters,
};
