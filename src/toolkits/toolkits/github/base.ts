import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { GithubTools } from "./tools";
import {
  searchRepositoriesTool,
  repoInfoTool,
  searchCodeTool,
  searchUsersTool,
  userRepoDataTool,
  userDataTool,
  orgDataTool,
} from "./tools";

export const githubParameters = z.object({});

export const baseGithubToolkitConfig: ToolkitConfig<
  GithubTools,
  typeof githubParameters.shape
> = {
  tools: {
    [GithubTools.SearchRepos]: searchRepositoriesTool,
    [GithubTools.RepoInfo]: repoInfoTool,
    [GithubTools.SearchCode]: searchCodeTool,
    [GithubTools.SearchUsers]: searchUsersTool,
    [GithubTools.UserRepoData]: userRepoDataTool,
    [GithubTools.UserData]: userDataTool,
    [GithubTools.OrgData]: orgDataTool,
  },
  parameters: githubParameters,
};
