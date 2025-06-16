import { type orgDataTool } from "./base";
import { type Octokit } from "octokit";
import type { ServerToolConfig } from "@/toolkits/types";
import { getTotalPrs } from "../../lib/prs";
import { getTotalCommits, getTotalCommitsSearch } from "../../lib/commits";

export const githubOrgDataToolConfigServer = (
  octokit: Octokit,
): ServerToolConfig<
  typeof orgDataTool.inputSchema.shape,
  typeof orgDataTool.outputSchema.shape
> => {
  return {
    callback: async ({ org }) => {
      const [{ data: organization }, { data: repositories }, prs] =
        await Promise.all([
          octokit.rest.orgs.get({
            org,
          }),
          octokit.rest.repos.listForOrg({
            org,
            sort: "updated",
            per_page: 20, // Get more repos for organizations
          }),
          getTotalPrs(octokit, `org:${org}`),
        ]);

      if (!organization) {
        throw new Error("Organization not found");
      }

      const repositoriesWithCommits = await Promise.all(
        repositories.map(async (repo) => {
          const commits = await getTotalCommits(octokit, org, repo.name);
          return {
            ...repo,
            commits,
          };
        }),
      );

      return {
        organization: {
          login: organization.login,
          name: organization.name,
          avatar_url: organization.avatar_url,
          description: organization.description,
          location: organization.location,
          email: organization.email,
          blog: organization.blog,
          twitter_username: organization.twitter_username,
          public_repos: organization.public_repos,
          public_gists: organization.public_gists,
          followers: organization.followers,
          following: organization.following,
          created_at: organization.created_at,
          updated_at: organization.updated_at,
        },
        repositories: repositoriesWithCommits.map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count ?? 0,
          forks: repo.forks_count ?? 0,
          url: repo.html_url,
          updated_at: repo.updated_at ?? new Date().toISOString(),
          topics: repo.topics ?? [],
          commits: repo.commits ?? 0,
        })),
        prs: prs,
      };
    },
    message:
      "The user is shown all of the organization data and repositories in the UI. Do not reiterate it. Give a 1-2 sentence summary of the organization and ask the user what they would like to do next.",
  };
};
