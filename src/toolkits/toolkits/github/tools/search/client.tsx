import React from "react";

import {
  Search,
  Star,
  Code,
  User,
  Building2,
  MapPin,
  BookMarked,
  Users,
} from "lucide-react";

import { HStack, VStack } from "@/components/ui/stack";

import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";

import { GithubAvatar } from "../../components/user-avatar";

import type { ClientToolConfig } from "@/toolkits/types";
import type { BundledLanguage } from "@/components/ui/code/shiki.bundle";
import type {
  searchRepositoriesTool,
  searchCodeTool,
  searchUsersTool,
} from "./base";

export const githubSearchRepositoriesToolConfigClient: ClientToolConfig<
  typeof searchRepositoriesTool.inputSchema.shape,
  typeof searchRepositoriesTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Search className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Search Repositories
          </span>
          <span className="text-sm">&quot;{args.query}&quot;</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.repositories.length) {
      return <div className="text-muted-foreground">No repositories found</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Repository Search Results
        </h1>
        <div className="flex flex-col">
          {result.repositories.map((repo) => (
            <HStack
              key={repo.full_name}
              className="group w-full cursor-pointer items-center border-b py-2 last:border-b-0 last:pb-0"
              onClick={() => {
                void append({
                  role: "user",
                  content: `Get more information about ${repo.full_name}`,
                });
              }}
            >
              <div className="mt-1 size-6 shrink-0 overflow-hidden rounded-sm">
                <GithubAvatar
                  login={repo.full_name?.split("/")[0] ?? ""}
                  className="size-full"
                />
              </div>
              <VStack className="group flex w-full cursor-pointer items-start gap-0">
                <HStack className="items-center gap-2">
                  <h3 className="group-hover:text-primary line-clamp-2 transition-colors">
                    {repo.full_name}
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
      </div>
    );
  },
};

export const githubSearchCodeToolConfigClient: ClientToolConfig<
  typeof searchCodeTool.inputSchema.shape,
  typeof searchCodeTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <Code className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Search Code
          </span>
          <span className="text-sm">&quot;{args.q}&quot;</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.results.length) {
      return <div className="text-muted-foreground">No code results found</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Code Search Results
        </h1>
        <div className="flex flex-col">
          {result.results.map((item, index) => (
            <VStack
              key={index}
              className="group w-full items-start py-2 last:pb-0"
            >
              <HStack className="items-center gap-2">
                <div className="size-4 shrink-0 overflow-hidden rounded-sm">
                  <GithubAvatar
                    login={item.repository?.split("/")[0] ?? ""}
                    className="size-full"
                  />
                </div>
                <h3 className="line-clamp-1 font-medium transition-colors">
                  {item.repository}
                </h3>
                <span className="text-muted-foreground text-xs">
                  / {item.path}
                </span>
              </HStack>
              {item.match && (
                <CodeBlock
                  language={item.path.split(".").pop() as BundledLanguage}
                  value={item.match}
                />
              )}
            </VStack>
          ))}
        </div>
      </div>
    );
  },
};

export const githubSearchUsersToolConfigClient: ClientToolConfig<
  typeof searchUsersTool.inputSchema.shape,
  typeof searchUsersTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <HStack className="gap-2">
        <User className="text-muted-foreground size-4" />
        <VStack className="items-start gap-0">
          <span className="text-muted-foreground/80 text-xs font-medium">
            Search Users
          </span>
          <span className="text-sm">&quot;{args.q}&quot;</span>
        </VStack>
      </HStack>
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.users.length) {
      return <div className="text-gray-500">No users found</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          User Search Results
        </h1>
        <div className="flex flex-col">
          {result.users.map((user, index) => (
            <HStack
              key={index}
              className="group w-full cursor-pointer items-center border-b py-2 last:border-b-0 last:pb-0"
            >
              <div className="size-8 shrink-0 overflow-hidden rounded-full">
                <GithubAvatar login={user.login} className="size-full" />
              </div>
              <VStack className="group flex w-full cursor-pointer items-start gap-1">
                <HStack className="items-center gap-2">
                  <h3 className="group-hover:text-primary line-clamp-1 font-medium transition-colors">
                    {user.login}
                  </h3>
                  {user.name && user.name !== user.login && (
                    <span className="text-muted-foreground text-sm">
                      ({user.name})
                    </span>
                  )}
                  {user.type === "Organization" && (
                    <Badge
                      variant="primary"
                      className="size-fit px-1 py-0 text-xs"
                    >
                      ORG
                    </Badge>
                  )}
                  {user.location && (
                    <HStack className="text-muted-foreground/60 items-center gap-1 text-xs">
                      <MapPin className="size-3" />
                      <span>{user.location}</span>
                    </HStack>
                  )}
                  {user.company && (
                    <HStack className="text-muted-foreground/60 items-center gap-1 text-xs">
                      <Building2 className="size-3" />
                      <span>{user.company}</span>
                    </HStack>
                  )}
                </HStack>
                {user.bio && (
                  <p className="text-muted-foreground/80 text-xs italic">
                    {user.bio}
                  </p>
                )}
              </VStack>
              <HStack className="items-center gap-2">
                {user.followers && (
                  <HStack className="items-center gap-1">
                    <Users className="text-primary size-4" />
                    <span>{user.followers.toLocaleString()}</span>
                  </HStack>
                )}
                {user.repos !== undefined && (
                  <HStack className="items-center gap-1">
                    <BookMarked className="text-primary size-4" />
                    <span>{user.repos}</span>
                  </HStack>
                )}
              </HStack>
            </HStack>
          ))}
        </div>
      </div>
    );
  },
};

// Keep the old export for backwards compatibility
export const githubSearchReposToolConfigClient =
  githubSearchRepositoriesToolConfigClient;
