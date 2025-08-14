import { z } from "zod";
import type { ToolkitConfig } from "@/toolkits/types";
import { EtsyTools } from "./tools/tools";
import { getListing } from "./tools/getListing/base";


export const etsyParameters = z.object({});

export const baseEtsyToolkitConfig: ToolkitConfig<
  EtsyTools,
  typeof etsyParameters.shape
> = {
  tools: {
    [EtsyTools.getListing]: getListing
  },
  parameters: etsyParameters,
}