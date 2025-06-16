import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseExaToolkitConfig } from "./base";
import { exaSearchToolConfigServer } from "./tools/search/server";
import { exaResearchPaperSearchToolConfigServer } from "./tools/research_paper_search/server";
import { exaCompanyResearchToolConfigServer } from "./tools/company_research/server";
import { exaCrawlingToolConfigServer } from "./tools/crawling/server";
import { exaCompetitorFinderToolConfigServer } from "./tools/competitor_finder/server";
import { exaLinkedinSearchToolConfigServer } from "./tools/linkedin_search/server";
import { exaWikipediaSearchToolConfigServer } from "./tools/wikipedia_search/server";
import { exaGithubSearchToolConfigServer } from "./tools/github_search/server";
import { ExaTools } from "./tools/tools";

export const exaToolkitServer = createServerToolkit(
  baseExaToolkitConfig,
  `You have access to the Exa search toolkit, which provides web search capabilities across different domains and platforms. This toolkit contains the following tools:

- **Search**: General web search with neural ranking
- **Research Paper Search**: Specialized academic paper search  
- **Company Research**: Search for company information and profiles
- **Crawling**: Extract content from specific URLs
- **Competitor Finder**: Find competitors for a given company
- **LinkedIn Search**: Search LinkedIn profiles and company pages
- **Wikipedia Search**: Search Wikipedia articles
- **GitHub Search**: Search GitHub repositories and code

**Tool Sequencing Guidelines:**
1. Start with broad searches (Search, Research Paper Search, Company Research) to gather initial information
2. Use specialized searches (LinkedIn, Wikipedia, GitHub) to get domain-specific details
3. Use Crawling to extract detailed content from specific URLs found in previous searches
4. Use Competitor Finder after Company Research to get comprehensive market analysis
5. Combine multiple search results to provide comprehensive answers

When using these tools, always consider the user's context and use the most appropriate search tool first, then follow up with complementary searches as needed.`,
  async () => {
    return {
      [ExaTools.Search]: exaSearchToolConfigServer,
      [ExaTools.ResearchPaperSearch]: exaResearchPaperSearchToolConfigServer,
      [ExaTools.CompanyResearch]: exaCompanyResearchToolConfigServer,
      [ExaTools.Crawling]: exaCrawlingToolConfigServer,
      [ExaTools.CompetitorFinder]: exaCompetitorFinderToolConfigServer,
      [ExaTools.LinkedinSearch]: exaLinkedinSearchToolConfigServer,
      [ExaTools.WikipediaSearch]: exaWikipediaSearchToolConfigServer,
      [ExaTools.GithubSearch]: exaGithubSearchToolConfigServer,
    };
  },
);
