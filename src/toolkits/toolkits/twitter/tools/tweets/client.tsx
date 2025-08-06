import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { getLatestTweetsTool } from "./base";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";

export const getLatestTweetsToolConfigClient = createClientTool(
  getLatestTweetsTool,
  {
    CallComponent: ({ args }) => {
      const filters = [];
      if (args.exclude_retweets) filters.push("excluding retweets");
      if (args.exclude_replies) filters.push("excluding replies");

      return (
        <div className="text-sm">
          Getting {args.max_results || 10} latest tweets from{" "}
          <span className="font-mono">@{args.username}</span>
          {filters.length > 0 && ` (${filters.join(", ")})`}
        </div>
      );
    },
    ResultComponent: ({ result, args }) => {
      if (!result.tweets.tweets.length) {
        return (
          <div className="text-muted-foreground">
            No tweets found for this user.
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Latest Tweets</h3>
            <Badge variant="secondary">{result.tweets.meta.result_count} tweets</Badge>
          </div>

          <div className="space-y-3">
            {result.tweets.tweets.map((tweet) => (
              <Card key={tweet.id} className="w-full">
                <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">@{args.username}</span>
                      <span className="text-muted-foreground text-sm">
                        {new Date(tweet.created_at || "").toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm whitespace-pre-wrap">{tweet.text}</p>

                  {tweet.entities?.urls && tweet.entities.urls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {tweet.entities.urls.map((url, index) => (
                        <a
                          key={index}
                          href={url.expanded_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-500 hover:underline"
                        >
                          {url.display_url}
                        </a>
                      ))}
                    </div>
                  )}

                  {tweet.entities?.hashtags &&
                    tweet.entities.hashtags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tweet.entities.hashtags.map((hashtag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            #{hashtag.tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                  <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {tweet.public_metrics?.reply_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat2 className="h-4 w-4" />
                      {tweet.public_metrics?.retweet_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {tweet.public_metrics?.like_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="h-4 w-4" />
                      {tweet.public_metrics?.quote_count}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    },
  },
);
