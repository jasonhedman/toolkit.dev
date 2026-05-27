import { ListTree } from "lucide-react";

import type { ClientToolConfig } from "@/toolkits/types";
import { CodeBlock } from "@/components/ui/code-block";
import type { baseListMcpToolsTool } from "./base";

export const mcpListToolsToolConfigClient: ClientToolConfig<
  typeof baseListMcpToolsTool.inputSchema.shape,
  typeof baseListMcpToolsTool.outputSchema.shape
> = {
  CallComponent: () => (
    <div className="text-muted-foreground flex items-center gap-2">
      <ListTree className="size-4" />
      <span className="text-sm">Listing MCP tools</span>
    </div>
  ),
  ResultComponent: ({ result }) => {
    if (!result.tools.length) {
      return <div className="text-muted-foreground">No MCP tools found</div>;
    }

    return (
      <div className="space-y-2">
        <h1 className="text-muted-foreground text-sm font-medium">MCP Tools</h1>
        <CodeBlock
          language="json"
          value={JSON.stringify(result.tools, null, 2)}
        />
      </div>
    );
  },
};
