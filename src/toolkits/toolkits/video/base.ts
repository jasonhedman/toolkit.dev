import { z } from "zod";

import { allVideoModels } from "@/ai/video";

import { VideoTools, baseGenerateTool } from "./tools";

import type { ToolkitConfig } from "@/toolkits/types";
import type { VideoModelProvider } from "@/ai/video/types";

export const videoParameters = z.object({
  model: z.enum(
    allVideoModels.map((model) => `${model.provider}:${model.modelId}`) as [
      `${VideoModelProvider}:${string}`,
      ...`${VideoModelProvider}:${string}`[],
    ],
  ),
});

export const baseVideoToolkitConfig: ToolkitConfig<
  VideoTools,
  typeof videoParameters.shape
> = {
  tools: {
    [VideoTools.Generate]: baseGenerateTool,
  },
  parameters: videoParameters,
};
