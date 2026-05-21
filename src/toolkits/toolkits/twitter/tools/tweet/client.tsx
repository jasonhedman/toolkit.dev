import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Repeat2, Search, Share } from "lucide-react";

import { getTweetTool } from "./base";

export const getTweetToolConfigClient = createClientTool(getTweetTool, {
  CallComponent: ({ args }) => (
    <div className="flex items-center gap-2 text-sm">
      <Search className="h-4 w-4" />
      Getting tweet <span className="font-mono">{args.tweetId}</span>
    </div>
  ),
  ResultComponent: ({ result: { tweet } }) => {
    const author = tweet.includes?.users?.[0];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              {author?.name ?? "Tweet"}
            </h3>
            {author?.username && (
              <p className="text-muted-foreground text-sm">
                @{author.username}
              </p>
            )}
          </div>
          <Badge variant="secondary">Tweet</Badge>
        </div>

        <p className="text-sm whitespace-pre-wrap">{tweet.data.text}</p>

        {tweet.data.entities?.urls && tweet.data.entities.urls.length > 0 && (
          <div className="space-y-1">
            {tweet.data.entities.urls.map((url, index) => (
              <a
                key={index}
                href={url.expanded_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-blue-500 hover:underline"
              >
                {url.display_url}
              </a>
            ))}
          </div>
        )}

        <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
          <Metric
            icon={MessageCircle}
            value={tweet.data.public_metrics?.reply_count}
          />
          <Metric
            icon={Repeat2}
            value={tweet.data.public_metrics?.retweet_count}
          />
          <Metric icon={Heart} value={tweet.data.public_metrics?.like_count} />
          <Metric icon={Share} value={tweet.data.public_metrics?.quote_count} />
        </div>

        {tweet.data.created_at && (
          <p className="text-muted-foreground text-xs">
            {new Date(tweet.data.created_at).toLocaleString()}
          </p>
        )}
      </div>
    );
  },
});

const Metric = ({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value?: number;
}) => (
  <div className="flex items-center gap-1">
    <Icon className="h-4 w-4" />
    {value?.toLocaleString() ?? "0"}
  </div>
);
