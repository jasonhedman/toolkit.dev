import { type userRepoDataTool } from "./base";
import { type Octokit } from "octokit";
import type { ServerToolConfig } from "@/toolkits/types";
import { getAllCommits } from "../../lib/commits";

export const githubUserRepoDataToolConfigServer = (
  octokit: Octokit,
): ServerToolConfig<
  typeof userRepoDataTool.inputSchema.shape,
  typeof userRepoDataTool.outputSchema.shape
> => {
  return {
    callback: async ({ username }) => {
      // Get user data
      const { data: user } = await octokit.rest.users.getByUsername({
        username,
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get user's repositories
      const { data: repositories } = await octokit.rest.repos.listForUser({
        username,
        type: "owner",
        sort: "updated",
        per_page: 30, // Limit to recent 30 repos for performance
      });

      // Get commits for each repository (limited to avoid rate limits)
      const repoCommitData = await Promise.allSettled(
        repositories.slice(0, 10).map(async (repo) => {
          try {
            const commits = await getAllCommits(octokit, username, repo.name);
            return { repoName: repo.name, commits };
          } catch (error) {
            console.warn(`Failed to fetch commits for ${repo.name}:`, error);
            return { repoName: repo.name, commits: [] };
          }
        })
      );

      // Combine all commits and create activity buckets
      const allCommits = repoCommitData
        .filter((result): result is PromiseFulfilledResult<{ repoName: string; commits: any[] }> => 
          result.status === 'fulfilled'
        )
        .flatMap(result => result.value.commits);

      const totalCommits = allCommits.length;

      // Create buckets for activity chart (similar to repo tool)
      const numBuckets = 96;
      const now = new Date();
      const startDate = new Date(user.created_at);
      const totalTime = now.getTime() - startDate.getTime();
      const bucketSize = totalTime / numBuckets;
      const buckets = Array.from({ length: numBuckets }, () => 0);

      allCommits.forEach((commit) => {
        if (!commit.commit?.author?.date) return;

        const commitDate = new Date(commit.commit.author.date);
        const diff = commitDate.getTime() - startDate.getTime();
        const bucketIndex = Math.floor(diff / bucketSize);

        if (bucketIndex >= 0 && bucketIndex < numBuckets) {
          buckets[bucketIndex]!++;
        }
      });

      return {
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          location: user.location,
          company: user.company,
          twitter_username: user.twitter_username,
          email: user.email,
          blog: user.blog,
          public_repos: user.public_repos,
          followers: user.followers,
          following: user.following,
        },
        repositories: repositories.map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count ?? 0,
          forks: repo.forks_count ?? 0,
          url: repo.html_url,
          updated_at: repo.updated_at ?? new Date().toISOString(),
        })),
        commits: buckets.map((count, index) => ({
          date: new Date(
            startDate.getTime() + index * bucketSize,
          ).toISOString(),
          count,
        })),
        totalCommits,
      };
    },
    message:
      "The user is shown all of the data in the UI. Do not reiterate it. Give a 1-2 sentence summary of the results and ask the user what they would like to do next.",
  };
};