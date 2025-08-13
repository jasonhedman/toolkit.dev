import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseTwitterToolkitConfig } from "./base";
import {
  getUserProfileToolConfigServer,
  getLatestTweetsToolConfigServer,
} from "./tools/server";
import { TwitterTools } from "./tools";
import { api } from "@/trpc/server";
import { TwitterApi } from "twitter-api-v2";

export const twitterToolkitServer = createServerToolkit(
  baseTwitterToolkitConfig,
  `You have access to the Twitter toolkit for fetching user profiles and tweets. This toolkit provides:

- **Get User Profile**: Retrieve detailed information about a Twitter user by their username
- **Get Latest Tweets**: Fetch the most recent tweets from a user (up to 100 tweets)

**Tool Sequencing Strategies:**
1. **User Research**: Start with Get User Profile to understand a user's background, then use Get Latest Tweets to see their recent activity
2. **Content Analysis**: Use Get Latest Tweets to analyze a user's recent posts and engagement patterns
3. **Profile Verification**: Combine Get User Profile with Get Latest Tweets to verify user authenticity and activity

**Best Practices:**
- Use usernames without the @ symbol (e.g., 'elonmusk' not '@elonmusk')
- For tweet analysis, start with fewer results (10-20) to get a quick overview
- Use the exclude_retweets and exclude_replies options to focus on original content
- Consider the user's follower count and verification status when analyzing their influence`,
  async () => {
    const account = await api.accounts.getAccountByProvider("twitter");

    if (!account) {
      throw new Error(
        "No Twitter account found. Please connect your Twitter account first.",
      );
    }

    if (!account.access_token) {
      throw new Error(
        "Twitter access token not found. Please reconnect your Twitter account.",
      );
    }

    // Create Twitter API client with user's access token
    const client = new TwitterApi(account.access_token);

    return {
      [TwitterTools.GetUserProfile]: getUserProfileToolConfigServer(client),
      [TwitterTools.GetLatestTweets]: getLatestTweetsToolConfigServer(client),
    };
  },
);
