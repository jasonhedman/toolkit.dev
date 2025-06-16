import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getUserFollowingTool } from "./base";
import { HStack, VStack } from "@/components/ui/stack";
import { UserCheck, Shield } from "lucide-react";
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

export const getUserFollowingToolConfigClient: ClientToolConfig<
  typeof getUserFollowingTool.inputSchema.shape,
  typeof getUserFollowingTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <UserCheck className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Following
          </span>
          <span className="text-sm">{args.user_identifier}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.following.length) {
      return (
        <div className="text-muted-foreground text-sm">No following found</div>
      );
    }

    return (
      <div className="space-y-1">
        <h1 className="text-muted-foreground text-sm font-medium">
          Following ({result.following.length})
        </h1>
        <div className="flex flex-col divide-y">
          {result.following.map((user) => (
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
                className="size-10 shrink-0"
              />
              <VStack className="flex-1 items-start gap-1">
                <HStack className="items-center gap-2">
                  <span className="text-sm font-medium group-hover:text-blue-500">
                    {user.name}
                  </span>
                  {user.verified && <Shield className="size-3 text-blue-500" />}
                </HStack>
                <span className="text-muted-foreground text-xs">
                  @{user.username}
                </span>
                {user.description && (
                  <p className="text-muted-foreground line-clamp-1 text-xs">
                    {user.description}
                  </p>
                )}
              </VStack>
              <VStack className="text-muted-foreground items-end gap-0 text-xs">
                <span>
                  {formatNumber(user.public_metrics.followers_count)} followers
                </span>
              </VStack>
            </HStack>
          ))}
        </div>
      </div>
    );
  },
};
