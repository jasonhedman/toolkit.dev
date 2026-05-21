import React from "react";

import { GenerationLoading } from "../../../components/generation-loading";

import type { baseGenerateTool } from "./base";

import type { ClientToolConfig } from "@/toolkits/types";

export const generateToolConfigClient: ClientToolConfig<
  typeof baseGenerateTool.inputSchema.shape,
  typeof baseGenerateTool.outputSchema.shape
> = {
  CallComponent: ({ args, isPartial }) => {
    return (
      <GenerationLoading
        kind="video"
        prompt={args.prompt}
        isPartial={isPartial}
      />
    );
  },
  ResultComponent: ({ result }) => {
    return <video src={result.url} autoPlay loop muted playsInline />;
  },
};
