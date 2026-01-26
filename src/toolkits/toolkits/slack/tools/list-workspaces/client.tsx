import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { listWorkspacesTool } from "./base";

export const listWorkspacesToolConfigClient = createClientTool(
    listWorkspacesTool,
    {
        CallComponent: () => (
            <h3 className="mb-2 font-semibold">Get Workspace Info</h3>
        ),
        ResultComponent: ({ result: { team } }) => (
            <div className="">
                <h3 className="mb-2 font-semibold">Workspace Information</h3>
                <div className="space-y-2 text-sm">
                    <div>
                        <span className="font-medium">Name:</span> {team.name}
                    </div>
                    {team.domain && (
                        <div>
                            <span className="font-medium">Domain:</span> {team.domain}.slack.com
                        </div>
                    )}
                    {team.email_domain && (
                        <div>
                            <span className="font-medium">Email Domain:</span>{" "}
                            {team.email_domain}
                        </div>
                    )}
                    <div className="text-xs text-gray-500">ID: {team.id}</div>
                </div>
            </div>
        ),
    },
);
