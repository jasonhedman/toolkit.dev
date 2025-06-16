import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getUserTool } from "./base";
import { HStack, VStack } from "@/components/ui/stack";
import { User, Shield, MapPin, LinkIcon, Calendar } from "lucide-react";
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

export const getUserToolConfigClient: ClientToolConfig<
  typeof getUserTool.inputSchema.shape,
  typeof getUserTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <User className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Get User
          </span>
          <span className="text-sm">{args.user_identifier}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result, append }) => {
    const { user } = result;

    return (
      <div className="space-y-3">
        <h1 className="text-muted-foreground text-sm font-medium">
          User Profile
        </h1>
        <VStack className="items-start gap-4 rounded-lg border p-4">
          <HStack className="w-full items-start gap-4">
            <TwitterAvatar
              src={user.profile_image_url}
              username={user.username}
              className="size-16 shrink-0"
            />
            <VStack className="flex-1 items-start gap-2">
              <VStack className="items-start gap-1">
                <HStack className="items-center gap-2">
                  <span className="text-lg font-bold">{user.name}</span>
                  {user.verified && <Shield className="size-5 text-blue-500" />}
                  {user.protected && (
                    <Badge variant="secondary" className="text-xs">
                      Protected
                    </Badge>
                  )}
                </HStack>
                <span className="text-muted-foreground">@{user.username}</span>
              </VStack>

              <HStack className="items-center gap-6 text-sm">
                <span>
                  <strong>
                    {formatNumber(user.public_metrics.followers_count)}
                  </strong>{" "}
                  Followers
                </span>
                <span>
                  <strong>
                    {formatNumber(user.public_metrics.following_count)}
                  </strong>{" "}
                  Following
                </span>
                <span>
                  <strong>
                    {formatNumber(user.public_metrics.tweet_count)}
                  </strong>{" "}
                  Tweets
                </span>
              </HStack>
            </VStack>
          </HStack>

          {user.description && (
            <p className="text-sm leading-relaxed">{user.description}</p>
          )}

          <VStack className="text-muted-foreground items-start gap-2 text-sm">
            {user.location && (
              <HStack className="items-center gap-2">
                <MapPin className="size-4" />
                <span>{user.location}</span>
              </HStack>
            )}
            {user.url && (
              <HStack className="items-center gap-2">
                <LinkIcon className="size-4" />
                <a
                  href={user.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {user.url}
                </a>
              </HStack>
            )}
            <HStack className="items-center gap-2">
              <Calendar className="size-4" />
              <span>Joined {formatDate(user.created_at)}</span>
            </HStack>
          </VStack>

          <HStack className="gap-2">
            <button
              onClick={() => {
                void append({
                  role: "user",
                  content: `Get recent tweets from @${user.username}`,
                });
              }}
              className="rounded-full bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
            >
              View Tweets
            </button>
            <button
              onClick={() => {
                void append({
                  role: "user",
                  content: `Get followers for @${user.username}`,
                });
              }}
              className="rounded-full bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            >
              View Followers
            </button>
          </HStack>
        </VStack>
      </div>
    );
  },
};
