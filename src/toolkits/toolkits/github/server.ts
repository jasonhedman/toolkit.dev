import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseGithubToolkitConfig } from "./base";
import {
  githubSearchRepositoriesToolConfigServer,
  githubSearchCodeToolConfigServer,
  githubSearchUsersToolConfigServer,
  githubRepoInfoToolConfigServer,
  githubUserRepoDataToolConfigServer,
  githubUserDataToolConfigServer,
  githubOrgDataToolConfigServer,
} from "./tools/server";
import { GithubTools } from "./tools";
import { api } from "@/trpc/server";
import { Octokit } from "octokit";

export const githubToolkitServer = createServerToolkit(
  baseGithubToolkitConfig,
  async () => {
    const account = await api.accounts.getAccountByProvider("github");

    if (!account) {
      throw new Error("No account found");
    }

    const octokit = new Octokit({
      auth: account.access_token,
    });

    return {
      [GithubTools.SearchRepos]: githubSearchRepositoriesToolConfigServer(octokit),
      [GithubTools.SearchCode]: githubSearchCodeToolConfigServer(octokit),
      [GithubTools.SearchUsers]: githubSearchUsersToolConfigServer(octokit),
      [GithubTools.RepoInfo]: githubRepoInfoToolConfigServer(octokit),
      [GithubTools.UserRepoData]: githubUserRepoDataToolConfigServer(octokit),
      [GithubTools.UserData]: githubUserDataToolConfigServer(octokit),
      [GithubTools.OrgData]: githubOrgDataToolConfigServer(octokit),
    };
  },
);
