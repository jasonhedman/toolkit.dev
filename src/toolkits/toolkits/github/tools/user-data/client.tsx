import React from "react";

import Link from "next/link";

import type { userDataTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { HStack, VStack } from "@/components/ui/stack";
import {
  Globe,
  Mail,
  Search,
  Star,
  Users,
  Building,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import { GithubAvatar } from "../../components/user-avatar";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";

export const githubUserDataToolConfigClient: ClientToolConfig<
  typeof userDataTool.inputSchema.shape,
  typeof userDataTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Search className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Fetching User Data
          </span>
          <span className="text-sm">{args.username}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result: { user } }) => {
    return (
      <div className="flex flex-col gap-4">
        {/* User Header */}
        <HStack className="gap-4">
          <VStack className="flex-1 items-start">
            <HStack className="flex-1">
              <GithubAvatar login={user.login} className="size-16" />
              <VStack className="items-start gap-1">
                <HStack className="items-center gap-2">
                  <h3 className="text-2xl font-bold md:text-3xl">
                    {user.name ?? user.login}
                  </h3>
                </HStack>
                <p className="text-muted-foreground text-sm">@{user.login}</p>
                {user.bio && (
                  <p className="text-muted-foreground mt-2">{user.bio}</p>
                )}
                
                {/* User Details */}
                <VStack className="items-start gap-1 mt-2">
                  {user.company && (
                    <HStack className="gap-2 text-sm">
                      <Building className="size-4" />
                      <span>{user.company}</span>
                    </HStack>
                  )}
                  {user.location && (
                    <HStack className="gap-2 text-sm">
                      <MapPin className="size-4" />
                      <span>{user.location}</span>
                    </HStack>
                  )}
                  <HStack className="gap-2 text-sm">
                    <Calendar className="size-4" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </HStack>
                </VStack>
              </VStack>
            </HStack>
            
            {/* Action Buttons */}
            <HStack className="flex-wrap mt-3">
              <Link href={`https://github.com/${user.login}`} target="_blank">
                <Button variant={"outline"} size={"sm"}>
                  <SiGithub className="size-4" />
                  <span>GitHub Profile</span>
                </Button>
              </Link>

              {user.blog && (
                <Link href={user.blog} target="_blank">
                  <Button variant={"outline"} size={"sm"}>
                    <Globe className="size-4" />
                    <span>Website</span>
                  </Button>
                </Link>
              )}

              {user.twitter_username && (
                <Link
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                >
                  <Button variant={"outline"} size={"sm"}>
                    <SiX className="size-4" />
                    <span>Twitter</span>
                  </Button>
                </Link>
              )}

              {user.email && (
                <Link href={`mailto:${user.email}`} target="_blank">
                  <Button variant={"outline"} size={"sm"}>
                    <Mail className="size-4" />
                    <span>Email</span>
                  </Button>
                </Link>
              )}
            </HStack>
          </VStack>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
            {[
              {
                icon: Star,
                label: "Repositories",
                value: user.public_repos,
              },
              {
                icon: FileText,
                label: "Gists",
                value: user.public_gists,
              },
              {
                icon: Users,
                label: "Followers",
                value: user.followers,
              },
              {
                icon: Users,
                label: "Following",
                value: user.following,
              },
            ].map((item) => (
              <VStack key={item.label} className="items-center gap-1">
                <HStack className="gap-1 font-bold text-lg">
                  <item.icon className="size-5" />
                  {item.value.toLocaleString()}
                </HStack>
                <p className="text-muted-foreground text-xs text-center">
                  {item.label}
                </p>
              </VStack>
            ))}
          </div>
        </HStack>
      </div>
    );
  },
};