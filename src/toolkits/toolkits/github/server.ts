import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseGithubToolkitConfig } from "./base";
import {
  githubSearchRepositoriesToolConfigServer,
  githubSearchCodeToolConfigServer,
  githubSearchUsersToolConfigServer,
  githubRepoInfoToolConfigServer,
} from "./tools/server";
import { GithubTools } from "./tools";
import { api } from "@/trpc/server";
import { Octokit } from "octokit";

export const githubToolkitServer = createServerToolkit(
  baseGithubToolkitConfig,
  `You have access to the GitHub toolkit for comprehensive repository and code analysis. This toolkit provides:

- **Search Repositories**: Find GitHub repositories based on various criteria
- **Search Code**: Search for specific code patterns across GitHub repositories  
- **Search Users**: Find GitHub users and developers
- **Repository Info**: Get detailed information about specific repositories

**Tool Sequencing Strategies:**
1. **Repository Discovery**: Start with Search Repositories to find relevant projects, then use Repository Info for detailed analysis
2. **Code Investigation**: Use Search Code to find specific implementations, patterns, or solutions across repositories
3. **Developer Research**: Use Search Users to find contributors or organizations, then Search Repositories to see their projects
4. **Project Analysis**: Combine Repository Info with Search Code to understand project structure and implementation details

**Best Practices:**
- Use specific search terms and programming languages for better results
- Leverage GitHub's advanced search syntax (language:python, stars:>100, etc.)
- When analyzing projects, start with repository overview then drill down into specific code patterns
- For technical research, search code first to find implementations, then explore the containing repositories`,
  async () => {
    const account = await api.accounts.getAccountByProvider("github");

    if (!account) {
      throw new Error("No account found");
    }

    const octokit = new Octokit({
      auth: account.access_token,
    });

    return {
      [GithubTools.SearchRepos]:
        githubSearchRepositoriesToolConfigServer(octokit),
      [GithubTools.SearchCode]: githubSearchCodeToolConfigServer(octokit),
      [GithubTools.SearchUsers]: githubSearchUsersToolConfigServer(octokit),
      [GithubTools.RepoInfo]: githubRepoInfoToolConfigServer(octokit),
    };
  },
);
