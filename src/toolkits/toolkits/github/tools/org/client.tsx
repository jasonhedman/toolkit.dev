import React from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import type { orgDataTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { HStack, VStack } from "@/components/ui/stack";
import {
  Globe,
  Mail,
  Search,
  Star,
  GitCommit,
  GitPullRequest,
  BookMarked,
} from "lucide-react";
import { GithubAvatar } from "../../components/user-avatar";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";

export const githubOrgDataToolConfigClient: ClientToolConfig<
  typeof orgDataTool.inputSchema.shape,
  typeof orgDataTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Search className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Fetching Organization Data
          </span>
          <span className="text-sm">{args.org}</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({
    result: { organization, repositories, prs },
    append,
  }) => {
    return (
      <div className="flex flex-col gap-4">
        {/* Organization Banner */}
        <HStack className="gap-4">
          <VStack className="flex-1 items-start">
            <HStack className="flex-1">
              <GithubAvatar login={organization.login} className="size-10" />
              <VStack className="items-start gap-0">
                <HStack className="items-center gap-2">
                  <h3 className="text-xl font-bold md:text-2xl">
                    {organization.login}
                  </h3>
                </HStack>
                <p className="text-muted-foreground text-xs">
                  {organization.description}
                </p>
              </VStack>
            </HStack>
            <HStack className="flex-wrap">
              <Link
                href={`https://github.com/${organization.login}`}
                target="_blank"
              >
                <Button variant={"outline"} size={"sm"}>
                  <SiGithub className="size-4" />
                  <span>Profile</span>
                </Button>
              </Link>

              {organization.blog && (
                <Link href={organization.blog} target="_blank">
                  <Button variant={"outline"} size={"sm"}>
                    <Globe className="size-4" />
                    <span>Website</span>
                  </Button>
                </Link>
              )}

              {organization.twitter_username && (
                <Link
                  href={`https://twitter.com/${organization.twitter_username}`}
                  target="_blank"
                >
                  <Button variant={"outline"} size={"sm"}>
                    <SiX className="size-4" />
                    <span>Twitter</span>
                  </Button>
                </Link>
              )}

              {organization.email && (
                <Link href={`mailto:${organization.email}`} target="_blank">
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
                value: repositories.reduce(
                  (acc, repo) => acc + repo.commits,
                  0,
                ),
              },
              {
                icon: GitPullRequest,
                label: "PRs",
                value: prs,
              },
              {
                icon: BookMarked,
                label: "Stars",
                value: organization.public_repos,
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

        {/* Repository List */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold">Repositories</h4>
          <div className="grid">
            {repositories.slice(0, 5).map((repo) => (
              <HStack
                key={repo.name}
                className="group w-full cursor-pointer items-center border-b py-2 last:border-b-0 last:pb-0"
                onClick={() => {
                  void append({
                    role: "user",
                    content: `Get more information about ${repo.name}`,
                  });
                }}
              >
                <VStack className="group flex w-full cursor-pointer items-start gap-0">
                  <HStack className="items-center gap-2">
                    <h3 className="group-hover:text-primary line-clamp-2 transition-colors">
                      {repo.name}
                    </h3>
                    {repo.language && (
                      <Badge
                        variant="primary"
                        className="size-fit px-1 py-0 text-xs"
                      >
                        {repo.language}
                      </Badge>
                    )}
                  </HStack>
                  {repo.description && (
                    <p className="text-muted-foreground text-xs">
                      {repo.description}
                    </p>
                  )}
                </VStack>
                <HStack className="items-center gap-4">
                  <HStack className="gap-1 text-sm">
                    <Star className="size-4 text-yellow-500" />
                    {repo.stars.toLocaleString()}
                  </HStack>
                </HStack>
              </HStack>
            ))}
          </div>
          {repositories.length > 5 && (
            <p className="text-muted-foreground pt-2 text-xs">
              + {organization.public_repos - 5} more
            </p>
          )}
        </div>
      </div>
    );
  },
};
