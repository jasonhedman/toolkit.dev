import { TwitterTools } from "./tools";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { baseTwitterToolkitConfig } from "./base";
import {
  twitterSearchTweetsToolConfigClient,
  twitterGetTweetToolConfigClient,
  twitterGetUserToolConfigClient,
  twitterGetUserTimelineToolConfigClient,
  twitterGetUserFollowersToolConfigClient,
  twitterGetUserFollowingToolConfigClient,
  twitterGetTweetLikedByToolConfigClient,
  twitterGetTweetRetweetedByToolConfigClient,
} from "./tools/client";
import { SiX } from "@icons-pack/react-simple-icons";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { ToolkitGroups } from "@/toolkits/types";

export const twitterClientToolkit = createClientToolkit(
  baseTwitterToolkitConfig,
  {
    name: "X (Twitter)",
    description: "Search tweets, analyze user profiles, and explore social interactions",
    icon: SiX,
    form: null,
    addToolkitWrapper: ({ children }) => {
      const { data: hasAccount, isLoading } =
        api.accounts.hasProviderAccount.useQuery("twitter");

      if (isLoading) {
        return (
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="size-4 animate-spin" />
          </Button>
        );
      }

      if (!hasAccount) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void signIn("twitter", {
                callbackUrl: window.location.href,
              });
            }}
          >
            <SiX className="size-4" />
            Connect
          </Button>
        );
      }

      return children;
    },
    type: ToolkitGroups.DataSource,
  },
  {
    [TwitterTools.SearchTweets]: twitterSearchTweetsToolConfigClient,
    [TwitterTools.GetTweet]: twitterGetTweetToolConfigClient,
    [TwitterTools.GetUser]: twitterGetUserToolConfigClient,
    [TwitterTools.SearchUsers]: twitterGetUserToolConfigClient, // Reuse GetUser component since SearchUsers is disabled
    [TwitterTools.GetUserTimeline]: twitterGetUserTimelineToolConfigClient,
    [TwitterTools.GetUserFollowers]: twitterGetUserFollowersToolConfigClient,
    [TwitterTools.GetUserFollowing]: twitterGetUserFollowingToolConfigClient,
    [TwitterTools.GetTweetLikedBy]: twitterGetTweetLikedByToolConfigClient,
    [TwitterTools.GetTweetRetweetedBy]: twitterGetTweetRetweetedByToolConfigClient,
  },
);