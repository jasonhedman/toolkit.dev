import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { TwitterTools } from "./tools";
import { getUserProfileTool, getLatestTweetsTool } from "./tools";

export const twitterParameters = z.object({});

export const baseTwitterToolkitConfig: ToolkitConfig<
  TwitterTools,
  typeof twitterParameters.shape
> = {
  tools: {
    [TwitterTools.GetUserProfile]: getUserProfileTool,
    [TwitterTools.GetLatestTweets]: getLatestTweetsTool,
  },
  parameters: twitterParameters,
};
