import { SiDiscord } from "@icons-pack/react-simple-icons";

import { createClientToolkit } from "@/toolkits/create-toolkit";

import { baseDiscordToolkitConfig } from "./base";
import { DiscordTools } from "./tools";
import {
  listServersToolConfigClient,
  getUserInfoToolConfigClient,
} from "./tools/client";

import { Link } from "../components/link";

import { ToolkitGroups } from "@/toolkits/types";

import { DiscordWrapper } from "./wrapper";

export const discordClientToolkit = createClientToolkit(
  baseDiscordToolkitConfig,
  {
    name: "Discord",
    description: "Explore your Discord servers and account information",
    icon: SiDiscord,
    form: null,
    Wrapper: DiscordWrapper,
    type: ToolkitGroups.DataSource,
    envVars: [
      {
        type: "all",
        keys: ["AUTH_DISCORD_ID", "AUTH_DISCORD_SECRET"],
        description: (
          <span>
            Get an Auth Client ID and Secret from{" "}
            <Link href="https://discord.com/developers/applications">here</Link>
          </span>
        ),
      },
    ],
  },
  {
    [DiscordTools.ListServers]: listServersToolConfigClient,
    [DiscordTools.GetUserInfo]: getUserInfoToolConfigClient,
  },
);
