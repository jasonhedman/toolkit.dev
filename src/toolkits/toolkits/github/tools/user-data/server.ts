import { type userDataTool } from "./base";
import { type Octokit } from "octokit";
import type { ServerToolConfig } from "@/toolkits/types";
import { getTotalCommits, getTotalCommitsSearch } from "../../lib/commits";
import { getTotalPrs } from "../../lib/prs";

export const githubUserDataToolConfigServer = (
  octokit: Octokit,
): ServerToolConfig<
  typeof userDataTool.inputSchema.shape,
  typeof userDataTool.outputSchema.shape
> => {
  return {
    callback: async ({ username }) => {
      const [userResponse, commits, prs] = await Promise.all([
        octokit.rest.users.getByUsername({ username }),
        getTotalCommitsSearch(octokit, `author:${username}`),
        getTotalPrs(octokit, `author:${username}`),
      ]);
      const { data: user } = userResponse;

      if (!user) {
        throw new Error("User not found");
      }

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
          public_gists: user.public_gists,
          followers: user.followers,
          following: user.following,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        commits,
        prs,
      };
    },
    message:
      "The user is shown all of the profile data in the UI. Do not reiterate it. Give a 1-2 sentence summary of the user and ask the user what they would like to do next.",
  };
};
