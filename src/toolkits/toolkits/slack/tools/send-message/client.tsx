import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { sendMessageTool } from "./base";

export const sendMessageToolConfigClient = createClientTool(sendMessageTool, {
    CallComponent: () => (
        <h3 className="mb-2 font-semibold">Send Slack Message</h3>
    ),
    ResultComponent: ({ result }) => (
        <div className="">
            <h3 className="mb-2 font-semibold">Message Sent</h3>
            <div className="space-y-2 text-sm">
                <div>
                    <span className="font-medium">Channel:</span> {result.channel}
                </div>
                <div>
                    <span className="font-medium">Message:</span> {result.message.text}
                </div>
                <div className="text-xs text-gray-500">
                    Timestamp: {result.ts}
                </div>
            </div>
        </div>
    ),
});
