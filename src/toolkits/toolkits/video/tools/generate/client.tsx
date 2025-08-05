import React from "react";

import { Loader } from "@/components/ui/loader";
import type { baseGenerateTool } from "./base";

import type { ClientToolConfig } from "@/toolkits/types";

export const generateToolConfigClient: ClientToolConfig<
  typeof baseGenerateTool.inputSchema.shape,
  typeof baseGenerateTool.outputSchema.shape
> = {
  CallComponent: ({ args, isPartial }) => {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <Loader variant="wrench" />
        <span className="text-sm font-medium text-foreground">
          Generating your video...
        </span>
        <span className="text-sm font-light text-muted-foreground">
          "{args.prompt}"
        </span>
      </div>
    );
  },
  ResultComponent: ({ result }) => {
    return <video src={result.url} autoPlay loop muted playsInline />;
  },
};
