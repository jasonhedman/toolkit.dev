import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { TwitterTools } from "./tools";
import { getUserProfileTool, getLatestTweetsTool, getTweetTool } from "./tools";

export const twitterParameters = z.object({});

export const baseTwitterToolkitConfig: ToolkitConfig<
  TwitterTools,
  typeof twitterParameters.shape
> = {
  tools: {
    [TwitterTools.GetUserProfile]: getUserProfileTool,
    [TwitterTools.GetLatestTweets]: getLatestTweetsTool,
    [TwitterTools.GetTweet]: getTweetTool,
  },
  parameters: twitterParameters,
};
