import React from "react";
import { createClientTool } from "@/toolkits/create-tool";
import { BadgeCheck, CalendarDays, Shield } from "lucide-react";

import { getGuildMemberTool } from "./base";

export const getGuildMemberToolConfigClient = createClientTool(
  getGuildMemberTool,
  {
    CallComponent: ({ args }) => (
      <h3 className="mb-2 font-semibold">
        Getting Discord member info for {args.guildId ?? "..."}
      </h3>
    ),
    ResultComponent: ({ result: { member } }) => (
      <div>
        <h3 className="mb-2 font-semibold">Discord Server Membership</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-4" />
            <span className="font-medium">
              {member.nick ?? member.user?.username ?? "Member"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="size-4" />
            <span>
              Joined {new Date(member.joined_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="size-4" />
            <span>{member.roles.length} roles</span>
          </div>
          {member.premium_since && (
            <div className="text-gray-600">
              Boosting since{" "}
              {new Date(member.premium_since).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    ),
  },
);
