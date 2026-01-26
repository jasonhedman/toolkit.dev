import { SiSlack } from "@icons-pack/react-simple-icons";

import { createClientToolkit } from "@/toolkits/create-toolkit";

import { baseSlackToolkitConfig } from "./base";
import { SlackTools } from "./tools";
import {
    listChannelsToolConfigClient,
    sendMessageToolConfigClient,
    searchMessagesToolConfigClient,
    getUserInfoToolConfigClient,
    listWorkspacesToolConfigClient,
} from "./tools/client";

import { Link } from "../components/link";

import { ToolkitGroups } from "@/toolkits/types";

import { SlackWrapper } from "./wrapper";

export const slackClientToolkit = createClientToolkit(
    baseSlackToolkitConfig,
    {
        name: "Slack",
        description:
            "Interact with your Slack workspace - send messages, search, and manage channels",
        icon: SiSlack,
        form: null,
        Wrapper: SlackWrapper,
        type: ToolkitGroups.DataSource,
        envVars: [
            {
                type: "all",
                keys: ["AUTH_SLACK_ID", "AUTH_SLACK_SECRET"],
                description: (
                    <span>
                        Get an Auth Client ID and Secret from{" "}
                        <Link href="https://api.slack.com/apps">here</Link>
                    </span>
                ),
            },
        ],
    },
    {
        [SlackTools.ListChannels]: listChannelsToolConfigClient,
        [SlackTools.SendMessage]: sendMessageToolConfigClient,
        [SlackTools.SearchMessages]: searchMessagesToolConfigClient,
        [SlackTools.GetUserInfo]: getUserInfoToolConfigClient,
        [SlackTools.ListWorkspaces]: listWorkspacesToolConfigClient,
    },
);
