import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { TwitterTools } from "./tools";
import {
  searchTweetsTool,
  getTweetTool,
  getUserTool,
  searchUsersTool,
  getUserTimelineTool,
  getUserFollowersTool,
  getUserFollowingTool,
  getTweetLikedByTool,
  getTweetRetweetedByTool,
} from "./tools";

export const twitterParameters = z.object({});

export const baseTwitterToolkitConfig: ToolkitConfig<TwitterTools> = {
  tools: {
    [TwitterTools.SearchTweets]: searchTweetsTool,
    [TwitterTools.GetTweet]: getTweetTool,
    [TwitterTools.GetUser]: getUserTool,
    [TwitterTools.SearchUsers]: searchUsersTool,
    [TwitterTools.GetUserTimeline]: getUserTimelineTool,
    [TwitterTools.GetUserFollowers]: getUserFollowersTool,
    [TwitterTools.GetUserFollowing]: getUserFollowingTool,
    [TwitterTools.GetTweetLikedBy]: getTweetLikedByTool,
    [TwitterTools.GetTweetRetweetedBy]: getTweetRetweetedByTool,
  },
  parameters: twitterParameters,
};
