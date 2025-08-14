import React from "react";

import type { baseGenerateTool } from "./base";

import type { ClientToolConfig } from "@/toolkits/types";

export const generateToolConfigClient: ClientToolConfig<
  typeof baseGenerateTool.inputSchema.shape,
  typeof baseGenerateTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return <span className="opacity/60 text-sm font-light">{args.prompt}</span>;
  },
  ResultComponent: ({ result }) => {
    return <video src={result.url} autoPlay loop muted playsInline />;
  },
};
