import { Network } from "lucide-react";

import type { ClientToolConfig } from "@/toolkits/types";
import { CodeBlock } from "@/components/ui/code-block";
import type { baseCallMcpTool } from "./base";

export const mcpCallToolConfigClient: ClientToolConfig<
  typeof baseCallMcpTool.inputSchema.shape,
  typeof baseCallMcpTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => (
    <div className="text-muted-foreground flex items-center gap-2">
      <Network className="size-4" />
      <span className="text-sm">
        Calling MCP tool: {args.toolName ?? "..."}
      </span>
    </div>
  ),
  ResultComponent: ({ result }) => (
    <div className="space-y-2">
      <h1 className="text-muted-foreground text-sm font-medium">MCP Result</h1>
      <CodeBlock language="json" value={JSON.stringify(result, null, 2)} />
    </div>
  ),
};
