import { z } from "zod";

import {
    SlackTools,
    listChannelsTool,
    sendMessageTool,
    searchMessagesTool,
    getUserInfoTool,
    listWorkspacesTool,
} from "./tools";

import type { ToolkitConfig } from "@/toolkits/types";

export const slackParameters = z.object({
    // No parameters needed for OAuth-based tools
});

export const baseSlackToolkitConfig: ToolkitConfig<
    SlackTools,
    typeof slackParameters.shape
> = {
    tools: {
        [SlackTools.ListChannels]: listChannelsTool,
        [SlackTools.SendMessage]: sendMessageTool,
        [SlackTools.SearchMessages]: searchMessagesTool,
        [SlackTools.GetUserInfo]: getUserInfoTool,
        [SlackTools.ListWorkspaces]: listWorkspacesTool,
    },
    parameters: slackParameters,
};
