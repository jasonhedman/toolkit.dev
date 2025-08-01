import { z } from "zod";
import type { ToolkitConfig } from "@/toolkits/types";
import { VideoTools } from "./tools";
import { baseGenerateTool } from "./tools";

export const videoParameters = z.object({
  // any input needed from the user on the client
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
