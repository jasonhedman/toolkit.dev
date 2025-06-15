import React from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import type { userRepoDataTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { HStack, VStack } from "@/components/ui/stack";
import {
  GitCommit,
  Globe,
  Mail,
  Search,
  Star,
  GitFork,
  Users,
  Calendar,
} from "lucide-react";
import { GithubAvatar } from "../../components/user-avatar";
import { ActivityChart } from "../../components/activity-chart";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";

export const githubUserRepoDataToolConfigClient: ClientToolConfig<
  typeof userRepoDataTool.inputSchema.shape,
  typeof userRepoDataTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Search className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Fetching User Repository Data
          </span>
          <span className="text-sm">{args.username}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result: { user, repositories, commits, totalCommits } }) => {
    return (
      <div className="flex flex-col gap-4">
        {/* User Header */}
        <HStack className="gap-4">
          <VStack className="flex-1 items-start">
            <HStack className="flex-1">
              <GithubAvatar login={user.login} className="size-10" />
              <VStack className="items-start gap-0">
                <HStack className="items-center gap-2">
                  <h3 className="text-xl font-bold md:text-2xl">
                    {user.name ?? user.login}
                  </h3>
                  <span className="text-muted-foreground text-sm">@{user.login}</span>
                </HStack>
                {user.bio && (
                  <p className="text-muted-foreground text-xs">{user.bio}</p>
                )}
                {user.location && (
                  <p className="text-muted-foreground text-xs">{user.location}</p>
                )}
              </VStack>
            </HStack>
            <HStack className="flex-wrap">
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
          <div className="grid grid-cols-1 gap-2 rounded-lg p-2">
            {[
              {
                icon: GitCommit,
                label: "Commits",
                value: totalCommits,
              },
              {
                icon: Star,
                label: "Repos",
                value: user.public_repos,
              },
              {
                icon: Users,
                label: "Followers",
                value: user.followers,
              },
            ].map((item) => (
              <HStack
                key={item.label}
                className="flex-1 items-center justify-between gap-4"
              >
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <HStack key={item.label} className="gap-1 font-medium">
                  <item.icon className="size-4" />
                  {item.value.toLocaleString()}
                </HStack>
              </HStack>
            ))}
          </div>
        </HStack>

        {/* Activity Chart */}
        <div className="flex flex-col gap-2">
          <ActivityChart
            data={commits.map((commit) => ({
              timestamp: commit.date,
              count: commit.count,
            }))}
          />
        </div>

        {/* Repository List */}
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-semibold">Recent Repositories</h4>
          <div className="grid gap-3">
            {repositories.slice(0, 10).map((repo, index) => (
              <div
                key={index}
                className="group w-full cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Link href={repo.url} target="_blank" className="block">
                  <VStack className="items-start gap-2">
                    <HStack className="w-full items-start justify-between">
                      <VStack className="items-start gap-1">
                        <HStack className="items-center gap-2">
                          <h5 className="group-hover:text-primary font-medium transition-colors">
                            {repo.name}
                          </h5>
                          {repo.language && (
                            <Badge variant="secondary" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                        </HStack>
                        {repo.description && (
                          <p className="text-muted-foreground text-sm">
                            {repo.description}
                          </p>
                        )}
                      </VStack>
                      <VStack className="items-end gap-1">
                        <HStack className="gap-3 text-sm">
                          <HStack className="gap-1">
                            <Star className="size-4" />
                            {repo.stars}
                          </HStack>
                          <HStack className="gap-1">
                            <GitFork className="size-4" />
                            {repo.forks}
                          </HStack>
                        </HStack>
                        <p className="text-muted-foreground text-xs">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </p>
                      </VStack>
                    </HStack>
                  </VStack>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};