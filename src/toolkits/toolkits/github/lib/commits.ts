import { type Octokit } from "octokit";

interface CommitParams {
  since?: string;
  until?: string;
  author?: string;
  sha?: string;
}

export const getAllCommits = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  additionalParams?: CommitParams,
) => {
  const firstPage = await octokit.rest.repos.listCommits({
    ...additionalParams,
    owner,
    repo,
    per_page: 100,
    page: 1,
  });

  const lastPageMatch = firstPage.headers.link?.match(/<([^>]+)>; rel="last"/);
  const lastPageUrl = lastPageMatch?.[1];
  const totalPages = lastPageUrl
    ? parseInt(new URL(lastPageUrl).searchParams.get("page") ?? "1")
    : 1;

  const remainingPages =
    totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            octokit.rest.repos.listCommits({
              owner,
              repo,
              ...additionalParams,
              per_page: 100,
              page: i + 2,
            }),
          ),
        )
      : [];

  return [firstPage.data, ...remainingPages.map((page) => page.data)].flat();
};

export const getTotalCommits = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  additionalParams?: CommitParams,
) => {
  const firstPage = await octokit.rest.repos.listCommits({
    owner,
    repo,
    per_page: 1,
    ...additionalParams,
  });

  const lastPageMatch = firstPage.headers.link?.match(/<([^>]+)>; rel="last"/);
  const lastPageUrl = lastPageMatch?.[1];
  const totalPages = lastPageUrl
    ? parseInt(new URL(lastPageUrl).searchParams.get("page") ?? "1")
    : 1;

  return totalPages;
};

export const getTotalCommitsSearch = async (
  octokit: Octokit,
  query: string,
) => {
  const {
    data: { total_count },
  } = await octokit.rest.search.commits({
    q: query,
    per_page: 1,
  });

  return total_count;
};
