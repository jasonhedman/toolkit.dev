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
  GitFork,
  Users,
  Building,
  MapPin,
  Calendar,
  FileText,
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
  ResultComponent: ({ result: { organization, repositories } }) => {
    return (
      <div className="flex flex-col gap-4">
        {/* Organization Banner */}
        <div className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="p-6">
            <HStack className="gap-4">
              <VStack className="flex-1 items-start">
                <HStack className="flex-1">
                  <GithubAvatar login={organization.login} className="size-16" />
                  <VStack className="items-start gap-1">
                    <HStack className="items-center gap-2">
                      <h3 className="text-2xl font-bold md:text-3xl">
                        {organization.name ?? organization.login}
                      </h3>
                      <Building className="size-6 text-muted-foreground" />
                    </HStack>
                    <p className="text-muted-foreground text-sm">@{organization.login}</p>
                    {organization.description && (
                      <p className="text-muted-foreground mt-2 max-w-2xl">
                        {organization.description}
                      </p>
                    )}
                    
                    {/* Organization Details */}
                    <VStack className="items-start gap-1 mt-2">
                      {organization.location && (
                        <HStack className="gap-2 text-sm">
                          <MapPin className="size-4" />
                          <span>{organization.location}</span>
                        </HStack>
                      )}
                      <HStack className="gap-2 text-sm">
                        <Calendar className="size-4" />
                        <span>Created {new Date(organization.created_at).toLocaleDateString()}</span>
                      </HStack>
                    </VStack>
                  </VStack>
                </HStack>
                
                {/* Action Buttons */}
                <HStack className="flex-wrap mt-3">
                  <Link href={`https://github.com/${organization.login}`} target="_blank">
                    <Button variant={"outline"} size={"sm"}>
                      <SiGithub className="size-4" />
                      <span>GitHub Organization</span>
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
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-background/80 border p-4">
                {[
                  {
                    icon: Star,
                    label: "Repositories",
                    value: organization.public_repos,
                  },
                  {
                    icon: FileText,
                    label: "Gists",
                    value: organization.public_gists,
                  },
                  {
                    icon: Users,
                    label: "Followers",
                    value: organization.followers,
                  },
                  {
                    icon: Users,
                    label: "Following",
                    value: organization.following,
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
        </div>

        {/* Repository List */}
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-semibold">Repositories ({repositories.length})</h4>
          <div className="grid gap-3">
            {repositories.slice(0, 20).map((repo, index) => (
              <div
                key={index}
                className="group w-full cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <Link href={repo.url} target="_blank" className="block">
                  <VStack className="items-start gap-3">
                    <HStack className="w-full items-start justify-between">
                      <VStack className="flex-1 items-start gap-2">
                        <HStack className="items-center gap-2 flex-wrap">
                          <h5 className="group-hover:text-primary font-medium text-lg transition-colors">
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
                        {repo.topics.length > 0 && (
                          <HStack className="flex-wrap gap-1">
                            {repo.topics.slice(0, 5).map((topic) => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {repo.topics.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{repo.topics.length - 5}
                              </Badge>
                            )}
                          </HStack>
                        )}
                      </VStack>
                      <VStack className="items-end gap-2">
                        <HStack className="gap-4 text-sm">
                          <HStack className="gap-1">
                            <Star className="size-4" />
                            {repo.stars.toLocaleString()}
                          </HStack>
                          <HStack className="gap-1">
                            <GitFork className="size-4" />
                            {repo.forks.toLocaleString()}
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