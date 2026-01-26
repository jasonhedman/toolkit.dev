import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { listChannelsTool } from "./base";

export const listChannelsToolConfigClient = createClientTool(
    listChannelsTool,
    {
        CallComponent: () => (
            <h3 className="mb-2 font-semibold">List Slack Channels</h3>
        ),
        ResultComponent: ({ result: { channels } }) => (
            <div className="">
                <h3 className="mb-2 font-semibold">Your Slack Channels</h3>
                {channels.length === 0 ? (
                    <div className="text-sm text-gray-600">
                        No channels found in your workspace.
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                            Found {channels.length} channels:
                        </div>
                        <div className="space-y-1">
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">
                                            {channel.is_private ? "🔒" : "#"} {channel.name}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {channel.num_members} members
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ),
    },
);
