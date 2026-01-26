import { WebClient } from "@slack/web-api";

import { createServerToolkit } from "@/toolkits/create-toolkit";

import { baseSlackToolkitConfig } from "./base";
import { SlackTools } from "./tools";
import {
    listChannelsToolConfigServer,
    sendMessageToolConfigServer,
    searchMessagesToolConfigServer,
    getUserInfoToolConfigServer,
    listWorkspacesToolConfigServer,
} from "./tools/server";

import { api } from "@/trpc/server";

export const slackToolkitServer = createServerToolkit(
    baseSlackToolkitConfig,
    `You have access to the Slack toolkit for interacting with your Slack workspace. This toolkit provides:

- **List Channels**: Get a list of all channels in your workspace (public, private, DMs)
- **Send Message**: Send messages to channels or threads
- **Search Messages**: Search for messages across your workspace
- **Get User Info**: Retrieve information about your Slack account
- **List Workspaces**: Get information about your current workspace/team

**Tool Sequencing Strategies:**
1. **Channel Discovery**: Start with List Channels to see available channels
2. **Message Operations**: Use Send Message to post to channels, optionally using thread_ts for replies
3. **Information Retrieval**: Use Search Messages to find specific content
4. **User Context**: Use Get User Info to understand your account capabilities
5. **Workspace Info**: Use List Workspaces to get team details

**Best Practices:**
- Always get channel IDs using List Channels before sending messages
- Use search to find relevant context before posting
- Respect channel privacy settings
- Use threaded replies (thread_ts) to keep conversations organized`,
    async () => {
        const account = await api.accounts.getAccountByProvider("slack");

        if (!account) {
            throw new Error(
                "No Slack account found. Please connect your Slack account first.",
            );
        }

        if (!account.access_token) {
            throw new Error("No access token available for Slack account.");
        }

        const client = new WebClient(account.access_token);

        return {
            [SlackTools.ListChannels]: listChannelsToolConfigServer(client),
            [SlackTools.SendMessage]: sendMessageToolConfigServer(client),
            [SlackTools.SearchMessages]: searchMessagesToolConfigServer(client),
            [SlackTools.GetUserInfo]: getUserInfoToolConfigServer(client),
            [SlackTools.ListWorkspaces]: listWorkspacesToolConfigServer(client),
        };
    },
);
