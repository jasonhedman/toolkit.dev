import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { addBookmarkTool } from "./base";

export const addBookmarkToolConfigClient = createClientTool(addBookmarkTool, {
    CallComponent: () => <h3 className="mb-2 font-semibold">Add Bookmark</h3>,
    ResultComponent: ({ result: { bookmarked, tweet_id, rate_limit } }) => (
        <div className="">
            <h3 className="mb-2 font-semibold">Bookmark Added</h3>

            {rate_limit && rate_limit.remaining < 10 && (
                <div className="mb-3 rounded-md bg-yellow-50 p-3 text-sm">
                    <div className="font-medium text-yellow-800">⚠️ Rate Limit Warning</div>
                    <div className="text-yellow-700">
                        {rate_limit.remaining} of {rate_limit.limit} requests remaining.
                    </div>
                </div>
            )}

            <div className="space-y-2 text-sm">
                {bookmarked ? (
                    <div className="rounded-md bg-green-50 p-3">
                        <div className="font-medium text-green-800">✓ Success</div>
                        <div className="text-green-700">
                            Tweet {tweet_id} has been bookmarked.
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md bg-red-50 p-3">
                        <div className="font-medium text-red-800">✗ Failed</div>
                        <div className="text-red-700">
                            Could not bookmark tweet {tweet_id}.
                        </div>
                    </div>
                )}
            </div>
        </div>
    ),
});
