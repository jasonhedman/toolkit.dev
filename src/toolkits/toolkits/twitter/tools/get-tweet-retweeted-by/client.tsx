import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getTweetRetweetedByTool } from "./base";
import { HStack, VStack } from "@/components/ui/stack";
import { Repeat2, Shield } from "lucide-react";
import { TwitterAvatar } from "../../components/user-avatar";

// Format numbers for display
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

export const getTweetRetweetedByToolConfigClient: ClientToolConfig<
  typeof getTweetRetweetedByTool.inputSchema.shape,
  typeof getTweetRetweetedByTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Repeat2 className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Retweeted By
          </span>
          <span className="text-sm">Tweet {args.tweet_id}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.users.length) {
      return (
        <div className="text-muted-foreground text-sm">No retweets found</div>
      );
    }

    return (
      <div className="space-y-1">
        <h1 className="text-muted-foreground text-sm font-medium">
          Retweeted by ({result.users.length})
        </h1>
        <div className="flex flex-col divide-y">
          {result.users.map((user) => (
            <HStack
              key={user.id}
              className="group cursor-pointer py-2 first:pt-0 last:pb-0"
              onClick={() => {
                void append({
                  role: "user",
                  content: `Get profile information for @${user.username}`,
                });
              }}
            >
              <TwitterAvatar
                src={user.profile_image_url}
                username={user.username}
                className="size-8 shrink-0"
              />
              <VStack className="flex-1 items-start gap-0">
                <HStack className="items-center gap-2">
                  <span className="text-sm font-medium group-hover:text-blue-500">
                    {user.name}
                  </span>
                  {user.verified && <Shield className="size-3 text-blue-500" />}
                </HStack>
                <span className="text-muted-foreground text-xs">
                  @{user.username}
                </span>
              </VStack>
              <span className="text-muted-foreground text-xs">
                {formatNumber(user.public_metrics.followers_count)} followers
              </span>
            </HStack>
          ))}
        </div>
      </div>
    );
  },
};
