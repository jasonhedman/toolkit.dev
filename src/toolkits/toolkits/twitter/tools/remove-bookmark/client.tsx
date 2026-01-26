import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { removeBookmarkTool } from "./base";

export const removeBookmarkToolConfigClient = createClientTool(
    removeBookmarkTool,
    {
        CallComponent: () => (
            <h3 className="mb-2 font-semibold">Remove Bookmark</h3>
        ),
        ResultComponent: ({ result: { removed, tweet_id, rate_limit } }) => (
            <div className="">
                <h3 className="mb-2 font-semibold">Bookmark Removed</h3>

                {rate_limit && rate_limit.remaining < 10 && (
                    <div className="mb-3 rounded-md bg-yellow-50 p-3 text-sm">
                        <div className="font-medium text-yellow-800">
                            ⚠️ Rate Limit Warning
                        </div>
                        <div className="text-yellow-700">
                            {rate_limit.remaining} of {rate_limit.limit} requests remaining.
                        </div>
                    </div>
                )}

                <div className="space-y-2 text-sm">
                    {removed ? (
                        <div className="rounded-md bg-green-50 p-3">
                            <div className="font-medium text-green-800">✓ Success</div>
                            <div className="text-green-700">
                                Tweet {tweet_id} has been removed from bookmarks.
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md bg-red-50 p-3">
                            <div className="font-medium text-red-800">✗ Failed</div>
                            <div className="text-red-700">
                                Could not remove bookmark for tweet {tweet_id}.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ),
    },
);
