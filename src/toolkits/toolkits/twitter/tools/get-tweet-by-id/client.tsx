import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { getTweetByIdTool } from "./base";

export const getTweetByIdToolConfigClient = createClientTool(
    getTweetByIdTool,
    {
        CallComponent: () => (
            <h3 className="mb-2 font-semibold">Get Tweet by ID</h3>
        ),
        ResultComponent: ({ result: { tweet, rate_limit } }) => (
            <div className="">
                <h3 className="mb-2 font-semibold">Tweet Details</h3>

                {rate_limit && rate_limit.remaining < 100 && (
                    <div className="mb-3 rounded-md bg-yellow-50 p-3 text-sm">
                        <div className="font-medium text-yellow-800">
                            ⚠️ Rate Limit Warning
                        </div>
                        <div className="text-yellow-700">
                            {rate_limit.remaining} of {rate_limit.limit} requests remaining.
                        </div>
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 text-sm text-gray-700">{tweet.text}</div>

                    <div className="mb-3 text-xs text-gray-500">
                        <div>Tweet ID: {tweet.id}</div>
                        <div>Author ID: {tweet.author_id}</div>
                        <div>Created: {new Date(tweet.created_at).toLocaleString()}</div>
                    </div>

                    {tweet.public_metrics && (
                        <div className="mb-3 flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <span>❤️</span>
                                <span>{tweet.public_metrics.like_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>🔄</span>
                                <span>
                                    {tweet.public_metrics.retweet_count.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>💬</span>
                                <span>{tweet.public_metrics.reply_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>💭</span>
                                <span>{tweet.public_metrics.quote_count.toLocaleString()}</span>
                            </div>
                            {tweet.public_metrics.bookmark_count !== undefined && (
                                <div className="flex items-center gap-1">
                                    <span>🔖</span>
                                    <span>
                                        {tweet.public_metrics.bookmark_count.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {tweet.entities?.hashtags && tweet.entities.hashtags.length > 0 && (
                        <div className="mb-2">
                            <div className="mb-1 text-xs font-medium text-gray-600">
                                Hashtags:
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {tweet.entities.hashtags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                                    >
                                        #{tag.tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {tweet.entities?.mentions && tweet.entities.mentions.length > 0 && (
                        <div className="mb-2">
                            <div className="mb-1 text-xs font-medium text-gray-600">
                                Mentions:
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {tweet.entities.mentions.map((mention, idx) => (
                                    <span
                                        key={idx}
                                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                    >
                                        @{mention.username}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {tweet.referenced_tweets && tweet.referenced_tweets.length > 0 && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                            <div className="mb-1 text-xs font-medium text-gray-600">
                                References:
                            </div>
                            {tweet.referenced_tweets.map((ref, idx) => (
                                <div key={idx} className="text-xs text-gray-600">
                                    {ref.type === "retweeted" && "🔄 Retweet of "}
                                    {ref.type === "quoted" && "💭 Quote of "}
                                    {ref.type === "replied_to" && "💬 Reply to "}
                                    tweet {ref.id}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        ),
    },
);
