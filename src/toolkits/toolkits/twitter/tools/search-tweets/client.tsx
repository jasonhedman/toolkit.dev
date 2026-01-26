import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { searchTweetsTool } from "./base";

export const searchTweetsToolConfigClient = createClientTool(
    searchTweetsTool,
    {
        CallComponent: () => (
            <h3 className="mb-2 font-semibold">Search Tweets</h3>
        ),
        ResultComponent: ({ result: { tweets, meta, rate_limit } }) => (
            <div className="">
                <h3 className="mb-2 font-semibold">Search Results</h3>

                {/* Rate Limit Warning */}
                {rate_limit && rate_limit.remaining < 50 && (
                    <div className="mb-3 rounded-md bg-yellow-50 p-3 text-sm">
                        <div className="font-medium text-yellow-800">
                            ⚠️ Rate Limit Warning
                        </div>
                        <div className="text-yellow-700">
                            {rate_limit.remaining} of {rate_limit.limit} requests remaining.
                            Resets at{" "}
                            {new Date(rate_limit.reset * 1000).toLocaleTimeString()}.
                        </div>
                    </div>
                )}

                {tweets.length === 0 ? (
                    <div className="text-sm text-gray-600">
                        No tweets found matching your query.
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                            Found {meta.result_count} tweets (showing {tweets.length}):
                        </div>
                        <div className="space-y-3">
                            {tweets.map((tweet) => (
                                <div
                                    key={tweet.id}
                                    className="rounded-lg border border-gray-200 p-3"
                                >
                                    <div className="mb-2 text-sm text-gray-700">
                                        {tweet.text}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div>
                                            {new Date(tweet.created_at).toLocaleDateString()}
                                        </div>
                                        {tweet.public_metrics && (
                                            <div className="flex gap-3">
                                                <span>❤️ {tweet.public_metrics.like_count}</span>
                                                <span>🔄 {tweet.public_metrics.retweet_count}</span>
                                                <span>💬 {tweet.public_metrics.reply_count}</span>
                                            </div>
                                        )}
                                    </div>
                                    {tweet.entities?.hashtags &&
                                        tweet.entities.hashtags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {tweet.entities.hashtags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                                                    >
                                                        #{tag.tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                        {meta.next_token && (
                            <div className="mt-2 text-xs text-gray-500">
                                More results available (use pagination)
                            </div>
                        )}
                    </div>
                )}
            </div>
        ),
    },
);
