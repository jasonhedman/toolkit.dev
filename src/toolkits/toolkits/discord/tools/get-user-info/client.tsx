import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { getUserInfoTool } from "./base";
import Image from "next/image";

export const getUserInfoToolConfigClient = createClientTool(getUserInfoTool, {
  CallComponent: () => (
    <h3 className="mb-2 font-semibold">Getting your Discord User Info</h3>
  ),
  ResultComponent: ({ result: { user } }) => (
    <div>
      <h3 className="mb-2 font-semibold">Your Discord Profile</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          {user.avatar && (
            <Image
              src={user.avatar}
              alt={user.username}
              className="h-12 w-12 rounded-full"
            />
          )}
          <div>
            <div className="text-lg font-semibold">{user.username}</div>
            {user.discriminator && (
              <div className="text-sm text-gray-500">#{user.discriminator}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">User ID:</span>
            <span className="ml-2 text-gray-600">{user.id}</span>
          </div>
          {user.email && (
            <div>
              <span className="font-medium">Email:</span>
              <span className="ml-2 text-gray-600">{user.email}</span>
            </div>
          )}
          <div>
            <span className="font-medium">Verified:</span>
            <span className="ml-2 text-gray-600">
              {user.verified ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="font-medium">Nitro:</span>
            <span className="ml-2 text-gray-600">
              {user.premium_type ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
});
