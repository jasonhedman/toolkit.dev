import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getTweetTool } from "./base";
import { HStack, VStack } from "@/components/ui/stack";
import { MessageCircle, Heart, Repeat2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export const getTweetToolConfigClient: ClientToolConfig<
  typeof getTweetTool.inputSchema.shape,
  typeof getTweetTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <MessageCircle className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Get Tweet
          </span>
          <span className="text-sm">ID: {args.tweet_id}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result }) => {
    const { tweet, author } = result;

    return (
      <div className="space-y-3">
        <h1 className="text-muted-foreground text-sm font-medium">
          Tweet Details
        </h1>
        <VStack className="items-start gap-3 rounded-lg border p-4">
          <HStack className="w-full items-start gap-3">
            <TwitterAvatar
              username={author.username}
              className="size-12 shrink-0"
            />
            <VStack className="flex-1 items-start gap-1">
              <HStack className="items-center gap-2">
                <span className="font-medium">{author.name}</span>
                {author.verified && <Shield className="size-4 text-blue-500" />}
                <span className="text-muted-foreground">
                  @{author.username}
                </span>
              </HStack>
              <span className="text-muted-foreground text-sm">
                {formatDate(tweet.created_at ?? "")}
              </span>
            </VStack>
          </HStack>

          <p className="text-sm leading-relaxed">{tweet.text}</p>

          <HStack className="text-muted-foreground items-center gap-6">
            <HStack className="items-center gap-1">
              <MessageCircle className="size-4" />
              <span className="text-sm">
                {formatNumber(tweet.public_metrics?.reply_count ?? 0)}
              </span>
            </HStack>
            <HStack className="items-center gap-1">
              <Repeat2 className="size-4" />
              <span className="text-sm">
                {formatNumber(tweet.public_metrics?.retweet_count ?? 0)}
              </span>
            </HStack>
            <HStack className="items-center gap-1">
              <Heart className="size-4" />
              <span className="text-sm">
                {formatNumber(tweet.public_metrics?.like_count ?? 0)}
              </span>
            </HStack>
          </HStack>

          {(tweet.lang ?? tweet.source) && (
            <HStack className="text-muted-foreground items-center gap-4 text-xs">
              {tweet.lang && <Badge variant="secondary">{tweet.lang}</Badge>}
              {tweet.source && <span>via {tweet.source}</span>}
            </HStack>
          )}
        </VStack>
      </div>
    );
  },
};
