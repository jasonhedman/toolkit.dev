import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { searchMessagesTool } from "./base";

export const searchMessagesToolConfigClient = createClientTool(
    searchMessagesTool,
    {
        CallComponent: () => (
            <h3 className="mb-2 font-semibold">Search Slack Messages</h3>
        ),
        ResultComponent: ({ result: { messages, total } }) => (
            <div className="">
                <h3 className="mb-2 font-semibold">Search Results</h3>
                {messages.length === 0 ? (
                    <div className="text-sm text-gray-600">No messages found.</div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                            Found {total} total results (showing {messages.length}):
                        </div>
                        <div className="space-y-2">
                            {messages.map((message, idx) => (
                                <div key={idx} className="border-l-2 border-gray-300 pl-3">
                                    <div className="text-sm">
                                        <span className="font-medium">
                                            {message.username || message.user}
                                        </span>
                                        {message.channel && (
                                            <span className="text-gray-500">
                                                {" "}
                                                in #{message.channel.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-700">{message.text}</div>
                                    {message.permalink && (
                                        <a
                                            href={message.permalink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline"
                                        >
                                            View message
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ),
    },
);
