import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { searchTweetsTool } from "./base";
import { HStack, VStack } from "@/components/ui/stack";
import { Search, MessageCircle, Heart, Repeat2 } from "lucide-react";
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

// Format date for display
const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
};

export const searchTweetsToolConfigClient: ClientToolConfig<
  typeof searchTweetsTool.inputSchema.shape,
  typeof searchTweetsTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Search className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Search Tweets
          </span>
          <span className="text-sm">&quot;{args.query}&quot;</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.tweets.length) {
      return (
        <div className="text-muted-foreground text-sm">No tweets found</div>
      );
    }

    return (
      <div className="space-y-1">
        <h1 className="text-muted-foreground text-sm font-medium">
          Tweet Search Results
        </h1>
        <div className="flex flex-col divide-y">
          {result.tweets.map((tweet) => (
            <VStack
              key={tweet.id}
              className="group w-full cursor-pointer py-3 first:pt-0 last:pb-0"
              onClick={() => {
                void append({
                  role: "user",
                  content: `Get more details about tweet ${tweet.id}`,
                });
              }}
            >
              <HStack className="w-full items-start gap-3">
                <TwitterAvatar
                  username={tweet.author_username}
                  className="size-10 shrink-0"
                />
                <VStack className="flex-1 items-start gap-1">
                  <HStack className="items-center gap-2">
                    <span className="text-sm font-medium">
                      {tweet.author_name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      @{tweet.author_username}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(tweet.created_at)}
                    </span>
                  </HStack>
                  <p className="line-clamp-3 text-left text-sm">{tweet.text}</p>
                  <HStack className="text-muted-foreground items-center gap-4 text-xs">
                    <HStack className="items-center gap-1">
                      <MessageCircle className="size-3" />
                      {formatNumber(tweet.public_metrics.reply_count)}
                    </HStack>
                    <HStack className="items-center gap-1">
                      <Repeat2 className="size-3" />
                      {formatNumber(tweet.public_metrics.retweet_count)}
                    </HStack>
                    <HStack className="items-center gap-1">
                      <Heart className="size-3" />
                      {formatNumber(tweet.public_metrics.like_count)}
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          ))}
        </div>
      </div>
    );
  },
};
