import { TwitterApi } from "twitter-api-v2";
import { searchTweetsTool } from "./base";

export const searchTweetsServer = (readOnlyClient: any) => ({
  ...searchTweetsTool,
  callback: async (args: any) => {
    try {
      const searchResult = await readOnlyClient.v2.search(args.query, {
        max_results: args.max_results,
        sort_order: args.sort_order,
        "tweet.fields": [
          "created_at",
          "public_metrics",
          "possibly_sensitive",
          "conversation_id",
          "author_id",
        ],
        "user.fields": ["username", "name", "verified"],
        expansions: ["author_id"],
      });

      const tweets = searchResult.data?.data ?? [];
      const users = searchResult.includes?.users ?? [];

      return {
        tweets: tweets.map((tweet: any) => {
          const author = users.find((user: any) => user.id === tweet.author_id);
          return {
            id: tweet.id,
            text: tweet.text,
            author_username: author?.username ?? "",
            author_name: author?.name ?? "",
            created_at: tweet.created_at ?? "",
            public_metrics: tweet.public_metrics ?? {
              retweet_count: 0,
              like_count: 0,
              reply_count: 0,
              quote_count: 0,
            },
            possibly_sensitive: tweet.possibly_sensitive,
            conversation_id: tweet.conversation_id,
          };
        }),
        next_token: searchResult.meta?.next_token,
      };
    } catch (error) {
      throw new Error(
        `Failed to search tweets: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  message: (result: any) => `Found ${result.tweets.length} tweets`,
});
