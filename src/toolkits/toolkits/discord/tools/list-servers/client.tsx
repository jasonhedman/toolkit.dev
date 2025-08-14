import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { listServersTool } from "./base";
import Image from "next/image";

export const listServersToolConfigClient = createClientTool(listServersTool, {
  CallComponent: () => (
    <h3 className="mb-2 font-semibold">List Discord Servers</h3>
  ),
  ResultComponent: ({ result: { servers } }) => (
    <div className="">
      <h3 className="mb-2 font-semibold">Your Discord Servers</h3>
      {servers.length === 0 ? (
        <div className="text-sm text-gray-600">
          You are not a member of any Discord servers.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Found {servers.length} servers:
          </div>
          <div className="space-y-1">
            {servers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  {server.icon && (
                    <Image
                      src={server.icon}
                      alt={server.name}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">{server.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {server.owner ? "Owner" : "Member"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ),
});
