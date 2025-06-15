import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const orgDataTool = createBaseTool({
  description: "Get information about a GitHub organization including repositories",
  inputSchema: z.object({
    org: z.string().describe("The GitHub organization name to get information for"),
  }),
  outputSchema: z.object({
    organization: z.object({
      login: z.string().describe("The organization login name"),
      name: z.string().nullish().describe("The display name of the organization"),
      avatar_url: z.string().describe("The avatar URL of the organization"),
      description: z.string().nullish().describe("The description of the organization"),
      location: z.string().nullish().describe("The location of the organization"),
      email: z.string().nullish().describe("The email of the organization"),
      blog: z.string().nullish().describe("The blog/website of the organization"),
      twitter_username: z.string().nullish().describe("The Twitter username of the organization"),
      public_repos: z.number().describe("The number of public repositories"),
      public_gists: z.number().describe("The number of public gists"),
      followers: z.number().describe("The number of followers"),
      following: z.number().describe("The number of users following"),
      created_at: z.string().describe("When the organization was created"),
      updated_at: z.string().describe("When the organization was last updated"),
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
        topics: z.array(z.string()).describe("Repository topics/tags"),
      }),
    ).describe("The organization's public repositories"),
  }),
});