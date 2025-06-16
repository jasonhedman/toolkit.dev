import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type {
  searchTweetsTool,
  getTweetTool,
} from "./tweet/base";
import type {
  getUserTool,
  getUserTimelineTool,
  getUserFollowersTool,
  getUserFollowingTool,
} from "./user/base";
import type {
  getTweetLikedByTool,
  getTweetRetweetedByTool,
} from "./interaction/base";
import { HStack, VStack } from "@/components/ui/stack";
import {
  Search,
  MessageCircle,
  User,
  Heart,
  Repeat2,
  Calendar,
  MapPin,
  LinkIcon,
  Users,
  UserCheck,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Avatar component for Twitter users
const TwitterAvatar: React.FC<{ 
  src?: string; 
  username: string; 
  className?: string; 
}> = ({ src, username, className = "size-8" }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={`@${username}`}
        className={`rounded-full ${className}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  
  return (
    <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium ${className}`}>
      {username.charAt(0).toUpperCase()}
    </div>
  );
};

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

// Search Tweets Tool
export const twitterSearchTweetsToolConfigClient: ClientToolConfig<
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
      return <div className="text-muted-foreground text-sm">No tweets found</div>;
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
              <HStack className="items-start gap-3 w-full">
                <TwitterAvatar
                  username={tweet.author_username}
                  className="size-10 shrink-0"
                />
                <VStack className="flex-1 items-start gap-1">
                  <HStack className="items-center gap-2">
                    <span className="font-medium text-sm">{tweet.author_name}</span>
                    <span className="text-muted-foreground text-sm">@{tweet.author_username}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(tweet.created_at)}
                    </span>
                  </HStack>
                  <p className="text-sm text-left line-clamp-3">
                    {tweet.text}
                  </p>
                  <HStack className="items-center gap-4 text-muted-foreground text-xs">
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

// Get Tweet Tool
export const twitterGetTweetToolConfigClient: ClientToolConfig<
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
    const { tweet } = result;

    return (
      <div className="space-y-3">
        <h1 className="text-muted-foreground text-sm font-medium">
          Tweet Details
        </h1>
        <VStack className="items-start gap-3 p-4 border rounded-lg">
          <HStack className="items-start gap-3 w-full">
            <TwitterAvatar
              username={tweet.author_username}
              className="size-12 shrink-0"
            />
            <VStack className="flex-1 items-start gap-1">
              <HStack className="items-center gap-2">
                <span className="font-medium">{tweet.author_name}</span>
                {tweet.author_verified && (
                  <Shield className="size-4 text-blue-500" />
                )}
                <span className="text-muted-foreground">@{tweet.author_username}</span>
              </HStack>
              <span className="text-muted-foreground text-sm">
                {formatDate(tweet.created_at)}
              </span>
            </VStack>
          </HStack>
          
          <p className="text-sm leading-relaxed">
            {tweet.text}
          </p>
          
          <HStack className="items-center gap-6 text-muted-foreground">
            <HStack className="items-center gap-1">
              <MessageCircle className="size-4" />
              <span className="text-sm">{formatNumber(tweet.public_metrics.reply_count)}</span>
            </HStack>
            <HStack className="items-center gap-1">
              <Repeat2 className="size-4" />
              <span className="text-sm">{formatNumber(tweet.public_metrics.retweet_count)}</span>
            </HStack>
            <HStack className="items-center gap-1">
              <Heart className="size-4" />
              <span className="text-sm">{formatNumber(tweet.public_metrics.like_count)}</span>
            </HStack>
          </HStack>
          
          {(tweet.lang || tweet.source) && (
            <HStack className="items-center gap-4 text-muted-foreground text-xs">
              {tweet.lang && <Badge variant="secondary">{tweet.lang}</Badge>}
              {tweet.source && <span>via {tweet.source}</span>}
            </HStack>
          )}
        </VStack>
      </div>
    );
  },
};

// Get User Tool
export const twitterGetUserToolConfigClient: ClientToolConfig<
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
        <VStack className="items-start gap-4 p-4 border rounded-lg">
          <HStack className="items-start gap-4 w-full">
            <TwitterAvatar
              src={user.profile_image_url}
              username={user.username}
              className="size-16 shrink-0"
            />
            <VStack className="flex-1 items-start gap-2">
              <VStack className="items-start gap-1">
                <HStack className="items-center gap-2">
                  <span className="font-bold text-lg">{user.name}</span>
                  {user.verified && (
                    <Shield className="size-5 text-blue-500" />
                  )}
                  {user.protected && (
                    <Badge variant="secondary" className="text-xs">Protected</Badge>
                  )}
                </HStack>
                <span className="text-muted-foreground">@{user.username}</span>
              </VStack>
              
              <HStack className="items-center gap-6 text-sm">
                <span><strong>{formatNumber(user.public_metrics.followers_count)}</strong> Followers</span>
                <span><strong>{formatNumber(user.public_metrics.following_count)}</strong> Following</span>
                <span><strong>{formatNumber(user.public_metrics.tweet_count)}</strong> Tweets</span>
              </HStack>
            </VStack>
          </HStack>
          
          {user.description && (
            <p className="text-sm leading-relaxed">
              {user.description}
            </p>
          )}
          
          <VStack className="items-start gap-2 text-muted-foreground text-sm">
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
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600"
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
              className="text-xs bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600"
            >
              View Followers
            </button>
          </HStack>
        </VStack>
      </div>
    );
  },
};

// User Timeline Tool
export const twitterGetUserTimelineToolConfigClient: ClientToolConfig<
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
      return <div className="text-muted-foreground text-sm">No tweets found</div>;
    }

    return (
      <div className="space-y-1">
        <h1 className="text-muted-foreground text-sm font-medium">
          Recent Tweets
        </h1>
        <div className="flex flex-col divide-y">
          {result.tweets.map((tweet) => (
            <VStack key={tweet.id} className="py-3 first:pt-0 last:pb-0">
              <VStack className="items-start gap-2 w-full">
                <span className="text-muted-foreground text-xs">
                  {formatDate(tweet.created_at)}
                </span>
                <p className="text-sm leading-relaxed">
                  {tweet.text}
                </p>
                <HStack className="items-center gap-4 text-muted-foreground text-xs">
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

// User Followers Tool
export const twitterGetUserFollowersToolConfigClient: ClientToolConfig<
  typeof getUserFollowersTool.inputSchema.shape,
  typeof getUserFollowersTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Users className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Followers
          </span>
          <span className="text-sm">{args.user_identifier}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.followers.length) {
      return <div className="text-muted-foreground text-sm">No followers found</div>;
    }

    return (
      <div className="space-y-1">
        <h1 className="text-muted-foreground text-sm font-medium">
          Followers ({result.followers.length})
        </h1>
        <div className="flex flex-col divide-y">
          {result.followers.map((user) => (
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
                  <span className="font-medium text-sm group-hover:text-blue-500">
                    {user.name}
                  </span>
                  {user.verified && (
                    <Shield className="size-3 text-blue-500" />
                  )}
                </HStack>
                <span className="text-muted-foreground text-xs">@{user.username}</span>
                {user.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {user.description}
                  </p>
                )}
              </VStack>
              <VStack className="items-end gap-0 text-xs text-muted-foreground">
                <span>{formatNumber(user.public_metrics.followers_count)} followers</span>
              </VStack>
            </HStack>
          ))}
        </div>
      </div>
    );
  },
};

// User Following Tool
export const twitterGetUserFollowingToolConfigClient: ClientToolConfig<
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
      return <div className="text-muted-foreground text-sm">No following found</div>;
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
                  <span className="font-medium text-sm group-hover:text-blue-500">
                    {user.name}
                  </span>
                  {user.verified && (
                    <Shield className="size-3 text-blue-500" />
                  )}
                </HStack>
                <span className="text-muted-foreground text-xs">@{user.username}</span>
                {user.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {user.description}
                  </p>
                )}
              </VStack>
              <VStack className="items-end gap-0 text-xs text-muted-foreground">
                <span>{formatNumber(user.public_metrics.followers_count)} followers</span>
              </VStack>
            </HStack>
          ))}
        </div>
      </div>
    );
  },
};

// Tweet Liked By Tool
export const twitterGetTweetLikedByToolConfigClient: ClientToolConfig<
  typeof getTweetLikedByTool.inputSchema.shape,
  typeof getTweetLikedByTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Heart className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Liked By
          </span>
          <span className="text-sm">Tweet {args.tweet_id}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.users.length) {
      return <div className="text-muted-foreground text-sm">No likes found</div>;
    }

    return (
      <div className="space-y-1">
        <h1 className="text-muted-foreground text-sm font-medium">
          Liked by ({result.users.length})
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
                  <span className="font-medium text-sm group-hover:text-blue-500">
                    {user.name}
                  </span>
                  {user.verified && (
                    <Shield className="size-3 text-blue-500" />
                  )}
                </HStack>
                <span className="text-muted-foreground text-xs">@{user.username}</span>
              </VStack>
              <span className="text-xs text-muted-foreground">
                {formatNumber(user.public_metrics.followers_count)} followers
              </span>
            </HStack>
          ))}
        </div>
      </div>
    );
  },
};

// Tweet Retweeted By Tool
export const twitterGetTweetRetweetedByToolConfigClient: ClientToolConfig<
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
      return <div className="text-muted-foreground text-sm">No retweets found</div>;
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
                  <span className="font-medium text-sm group-hover:text-blue-500">
                    {user.name}
                  </span>
                  {user.verified && (
                    <Shield className="size-3 text-blue-500" />
                  )}
                </HStack>
                <span className="text-muted-foreground text-xs">@{user.username}</span>
              </VStack>
              <span className="text-xs text-muted-foreground">
                {formatNumber(user.public_metrics.followers_count)} followers
              </span>
            </HStack>
          ))}
        </div>
      </div>
    );
  },
};