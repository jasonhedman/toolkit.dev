import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const userRepoDataTool = createBaseTool({
  description: "Get repository data for a specific user with commit activity chart",
  inputSchema: z.object({
    username: z.string().describe("The GitHub username to get repository data for"),
  }),
  outputSchema: z.object({
    user: z.object({
      login: z.string().describe("The username of the user"),
      name: z.string().nullish().describe("The display name of the user"),
      avatar_url: z.string().describe("The avatar URL of the user"),
      bio: z.string().nullish().describe("The bio of the user"),
      location: z.string().nullish().describe("The location of the user"),
      company: z.string().nullish().describe("The company the user works for"),
      twitter_username: z.string().nullish().describe("The Twitter username of the user"),
      email: z.string().nullish().describe("The email of the user"),
      blog: z.string().nullish().describe("The blog/website of the user"),
      public_repos: z.number().describe("The number of public repositories"),
      followers: z.number().describe("The number of followers"),
      following: z.number().describe("The number of users following"),
    }),
    repositories: z.array(
      z.object({
        name: z.string().describe("The name of the repository"),
        description: z.string().nullish().describe("The description of the repository"),
        language: z.string().nullish().describe("The primary language of the repository"),
        stars: z.number().describe("The number of stars"),
        forks: z.number().describe("The number of forks"),
        url: z.string().describe("The HTML URL of the repository"),
        updated_at: z.string().describe("When the repository was last updated"),
      }),
    ).describe("The user's public repositories"),
    commits: z.array(
      z.object({
        date: z.string().describe("The date of the commits"),
        count: z.number().describe("The number of commits on that date"),
      }),
    ).describe("Commit activity data across all repositories"),
    totalCommits: z.number().describe("Total number of commits across all repositories"),
  }),
});