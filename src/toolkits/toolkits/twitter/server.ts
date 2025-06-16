import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseTwitterToolkitConfig } from "./base";
import { TwitterTools } from "./tools";
import { TwitterApi } from "twitter-api-v2";
import { api } from "@/trpc/react";

export const twitterServerToolkit = createServerToolkit(
  baseTwitterToolkitConfig,
  "Twitter tools",
  async (params) => {
    const account = await api.accounts.getAccountByProvider.useQuery("twitter");

    if (!account) {
      throw new Error("No token found");
    }

    // Create Twitter API client with OAuth token
    const twitterClient = new TwitterApi(token);
    const readOnlyClient = twitterClient.readOnly;

    return {};
  },
);
