import { GithubTools } from "./tools";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { baseGithubToolkitConfig } from "./base";
import {
  githubSearchReposToolConfigClient,
  githubRepoInfoToolConfigClient,
  githubSearchCodeToolConfigClient,
  githubSearchUsersToolConfigClient,
} from "./tools/client";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { ToolkitGroups } from "@/toolkits/types";

export const githubClientToolkit = createClientToolkit(
  baseGithubToolkitConfig,
  {
    name: "GitHub",
    description: "Find and analyze repositories, users, and organizations",
    icon: SiGithub,
    form: null,
    addToolkitWrapper: ({ children }) => {
      const { data: hasAccount, isLoading } =
        api.accounts.hasProviderAccount.useQuery("github");

      if (isLoading) {
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="bg-transparent"
          >
            <Loader2 className="size-4 animate-spin" />
          </Button>
        );
      }

      if (!hasAccount) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void signIn("github", {
                callbackUrl: window.location.href,
              });
            }}
            className="bg-transparent"
          >
            Connect
          </Button>
        );
      }

      return children;
    },
    type: ToolkitGroups.DataSource,
  },
  {
    [GithubTools.SearchRepos]: githubSearchReposToolConfigClient,
    [GithubTools.RepoInfo]: githubRepoInfoToolConfigClient,
    [GithubTools.SearchCode]: githubSearchCodeToolConfigClient,
    [GithubTools.SearchUsers]: githubSearchUsersToolConfigClient,
  },
);
