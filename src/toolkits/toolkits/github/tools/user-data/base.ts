import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const userDataTool = createBaseTool({
  description: "Get profile information for a GitHub user",
  inputSchema: z.object({
    username: z
      .string()
      .describe("The GitHub username to get profile data for"),
  }),
  outputSchema: z.object({
    user: z.object({
      login: z.string().describe("The username of the user"),
      name: z.string().nullish().describe("The display name of the user"),
      avatar_url: z.string().describe("The avatar URL of the user"),
      bio: z.string().nullish().describe("The bio of the user"),
      location: z.string().nullish().describe("The location of the user"),
      company: z.string().nullish().describe("The company the user works for"),
      twitter_username: z
        .string()
        .nullish()
        .describe("The Twitter username of the user"),
      email: z.string().nullish().describe("The email of the user"),
      blog: z.string().nullish().describe("The blog/website of the user"),
      public_repos: z.number().describe("The number of public repositories"),
      public_gists: z.number().describe("The number of public gists"),
      followers: z.number().describe("The number of followers"),
      following: z.number().describe("The number of users following"),
      created_at: z.string().describe("When the user account was created"),
      updated_at: z.string().describe("When the user account was last updated"),
    }),
    commits: z.number().describe("The number of commits"),
    prs: z.number().describe("The number of PRs"),
  }),
});
