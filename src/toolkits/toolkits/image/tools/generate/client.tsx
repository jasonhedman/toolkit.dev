import React from "react";

import Image from "next/image";

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
        kind="image"
        prompt={args.prompt}
        isPartial={isPartial}
      />
    );
  },
  ResultComponent: ({ result }) => {
    return (
      <Image src={result.url} alt="Generated Image" width={500} height={500} />
    );
  },
};
