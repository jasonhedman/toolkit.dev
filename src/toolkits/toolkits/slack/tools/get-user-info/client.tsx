import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { getUserInfoTool } from "./base";

export const getUserInfoToolConfigClient = createClientTool(getUserInfoTool, {
    CallComponent: () => (
        <h3 className="mb-2 font-semibold">Get Slack User Info</h3>
    ),
    ResultComponent: ({ result: { user } }) => (
        <div className="">
            <h3 className="mb-2 font-semibold">Your Slack Profile</h3>
            <div className="space-y-2 text-sm">
                <div>
                    <span className="font-medium">Name:</span> {user.real_name || user.name}
                </div>
                {user.email && (
                    <div>
                        <span className="font-medium">Email:</span> {user.email}
                    </div>
                )}
                {user.profile?.display_name && (
                    <div>
                        <span className="font-medium">Display Name:</span>{" "}
                        {user.profile.display_name}
                    </div>
                )}
                {user.profile?.status_text && (
                    <div>
                        <span className="font-medium">Status:</span>{" "}
                        {user.profile.status_emoji} {user.profile.status_text}
                    </div>
                )}
                <div className="text-xs text-gray-500">
                    {user.is_admin && "Admin • "}
                    {user.is_owner && "Owner • "}
                    ID: {user.id}
                </div>
            </div>
        </div>
    ),
});
