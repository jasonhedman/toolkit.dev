import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getUserTimelineTool } from "./base";
import { HStack, VStack } from "@/components/ui/stack";
import { MessageCircle, Heart, Repeat2 } from "lucide-react";

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

export const getUserTimelineToolConfigClient: ClientToolConfig<
  typeof getUserTimelineTool.inputSchema.shape,
  typeof getUserTimelineTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <MessageCircle className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            User Timeline
          </span>
          <span className="text-sm">{args.user_identifier}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.tweets.length) {
      return (
        <div className="text-muted-foreground text-sm">No tweets found</div>
      );
    }

    return (
      <div className="space-y-1">
        <h1 className="text-muted-foreground text-sm font-medium">
          Recent Tweets
        </h1>
        <div className="flex flex-col divide-y">
          {result.tweets.map((tweet) => (
            <VStack key={tweet.id} className="py-3 first:pt-0 last:pb-0">
              <VStack className="w-full items-start gap-2">
                <span className="text-muted-foreground text-xs">
                  {formatDate(tweet.created_at)}
                </span>
                <p className="text-sm leading-relaxed">{tweet.text}</p>
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
            </VStack>
          ))}
        </div>
      </div>
    );
  },
};
