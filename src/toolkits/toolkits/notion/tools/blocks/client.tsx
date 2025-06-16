import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getBlocksTool, appendBlocksTool } from "./base";
import { Layers, Plus } from "lucide-react";
import { ToolCallDisplay } from "../../components";
import { NotionBlock } from "../../components/block";

export const notionGetBlocksToolConfigClient: ClientToolConfig<
  typeof getBlocksTool.inputSchema.shape,
  typeof getBlocksTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={Layers}
        label="Get Blocks"
        value={`${(args.block_id ?? "").slice(0, 8)}...`}
      />
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.results.length) {
      return <div className="text-muted-foreground">No blocks found</div>;
    }

    return (
      <div className="">
        <div className="flex flex-col">
          {result.results.map((block) => (
            <NotionBlock key={block.id} block={block} />
          ))}
        </div>
        {result.has_more && (
          <p className="text-muted-foreground mt-2 text-xs">
            More blocks available...
          </p>
        )}
      </div>
    );
  },
};

export const notionAppendBlocksToolConfigClient: ClientToolConfig<
  typeof appendBlocksTool.inputSchema.shape,
  typeof appendBlocksTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={Plus}
        label="Append Blocks"
        value={`${args.block_type ?? "paragraph"} - "${(args.content ?? "").slice(0, 30)}..."`}
      />
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.results.length) {
      return <div className="text-muted-foreground">No blocks created</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Blocks Added
        </h1>
        <div className="flex flex-col">
          {result.results.map((block) => (
            <NotionBlock key={block.id} block={block} />
          ))}
        </div>
      </div>
    );
  },
};
