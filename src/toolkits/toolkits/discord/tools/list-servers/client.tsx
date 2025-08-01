import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { listServersTool } from "./base";
import Image from "next/image";

export const listServersToolConfigClient = createClientTool(listServersTool, {
  CallComponent: ({ isPartial }) => (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold">List Discord Servers</h3>
      {isPartial ? (
        <div className="text-sm text-gray-500">Loading your servers...</div>
      ) : (
        <div className="text-sm text-gray-600">
          Fetching your Discord servers
        </div>
      )}
    </div>
  ),
  ResultComponent: ({ result }) => (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold">Your Discord Servers</h3>
      {result.success && result.servers ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Found {result.servers.length} servers:
          </div>
          <div className="space-y-1">
            {result.servers.map((server) => (
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
      ) : (
        <div className="text-red-600">
          ✗ Failed to load servers: {result.error}
        </div>
      )}
    </div>
  ),
});
