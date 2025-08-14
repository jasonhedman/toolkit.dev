import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { getUserProfileTool } from "./base";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck } from "lucide-react";

export const getUserProfileToolConfigClient = createClientTool(
  getUserProfileTool,
  {
    CallComponent: ({ args }) => (
      <div className="text-sm">
        Getting profile for <span className="font-mono">@{args.username}</span>
      </div>
    ),
    ResultComponent: ({ result }) => (
      <div className="w-full">
        <div className="flex flex-row items-center space-y-0 pb-2">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={result.user.data.profile_image_url ?? undefined}
            />
            <AvatarFallback>
              {result.user.data.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{result.user.data.name}</h3>
              {result.user.data.verified_type &&
                result.user.data.verified_type !== "none" && (
                  <BadgeCheck
                    className={`h-5 w-5 ${
                      result.user.data.verified_type === "blue"
                        ? "text-blue-500"
                        : result.user.data.verified_type === "government"
                          ? "text-gray-500"
                          : result.user.data.verified_type === "business"
                            ? "text-yellow-500"
                            : "text-gray-400"
                    }`}
                  />
                )}
            </div>
            <p className="text-muted-foreground text-sm">
              @{result.user.data.username}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {result.user.data.description && (
            <p className="text-sm">{result.user.data.description}</p>
          )}
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span>
              {result.user.data.public_metrics?.followers_count?.toLocaleString()}{" "}
              followers
            </span>
            <span>
              {result.user.data.public_metrics?.following_count?.toLocaleString()}{" "}
              following
            </span>
            <span>
              {result.user.data.public_metrics?.tweet_count?.toLocaleString()}{" "}
              tweets
            </span>
            {result.user.data.location && (
              <p className="text-muted-foreground text-sm">
                📍 {result.user.data.location}
              </p>
            )}
            {result.user.data.url && (
              <p className="text-muted-foreground text-sm">
                🔗{" "}
                <a
                  href={result.user.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {result.user.data.url}
                </a>
              </p>
            )}
          </div>
          <Separator />
          <p className="text-muted-foreground text-xs">
            Joined{" "}
            {new Date(result.user.data.created_at ?? "").toLocaleDateString()}
          </p>
        </div>
      </div>
    ),
  },
);
