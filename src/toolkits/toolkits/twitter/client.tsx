import { TwitterTools } from "./tools";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { baseTwitterToolkitConfig } from "./base";
import { searchTweetsToolConfigClient } from "./tools/search-tweets/client";
import { getTweetToolConfigClient } from "./tools/get-tweet/client";
import { getUserToolConfigClient } from "./tools/user/client";
import { getUserTimelineToolConfigClient } from "./tools/user/timeline/client";
import { getUserFollowersToolConfigClient } from "./tools/user/followers/client";
import { getUserFollowingToolConfigClient } from "./tools/user/following/client";
import { getTweetLikedByToolConfigClient } from "./tools/tweet/liked-by/client";
import { getTweetRetweetedByToolConfigClient } from "./tools/tweet/retweeted-by/client";
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
    description:
      "Search tweets, analyze user profiles, and explore social interactions",
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
    [TwitterTools.SearchTweets]: searchTweetsToolConfigClient,
    [TwitterTools.GetTweet]: getTweetToolConfigClient,
    [TwitterTools.GetUser]: getUserToolConfigClient,
    [TwitterTools.SearchUsers]: getUserToolConfigClient, // Reuse GetUser component since SearchUsers is disabled
    [TwitterTools.GetUserTimeline]: getUserTimelineToolConfigClient,
    [TwitterTools.GetUserFollowers]: getUserFollowersToolConfigClient,
    [TwitterTools.GetUserFollowing]: getUserFollowingToolConfigClient,
    [TwitterTools.GetTweetLikedBy]: getTweetLikedByToolConfigClient,
    [TwitterTools.GetTweetRetweetedBy]: getTweetRetweetedByToolConfigClient,
  },
);
