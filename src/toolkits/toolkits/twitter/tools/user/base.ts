import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getUserTool = createBaseTool({
  description:
    "Get detailed information about a Twitter user by their username or user ID. Returns profile information, verification status, and follower metrics.",
  inputSchema: z.object({
    user_identifier: z
      .string()
      .describe("Twitter username (without @) or user ID (e.g., 'elonmusk' or '44196397')"),
  }),
  outputSchema: z.object({
    user: z.object({
      id: z.string(),
      username: z.string(),
      name: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      url: z.string().optional(),
      verified: z.boolean().optional(),
      created_at: z.string(),
      profile_image_url: z.string().optional(),
      public_metrics: z.object({
        followers_count: z.number(),
        following_count: z.number(),
        tweet_count: z.number(),
        listed_count: z.number(),
      }),
      protected: z.boolean().optional(),
    }),
  }),
});

export const searchUsersTool = createBaseTool({
  description:
    "Search for Twitter users by keywords, names, or other criteria. Returns a list of matching user profiles.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query for users. Examples: 'name:John Doe', 'bio:developer', 'location:\"San Francisco\"', 'followers:>1000', 'verified:true'",
      ),
    max_results: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe("Maximum number of users to return (1-100)"),
  }),
  outputSchema: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        name: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        verified: z.boolean().optional(),
        public_metrics: z.object({
          followers_count: z.number(),
          following_count: z.number(),
          tweet_count: z.number(),
        }),
        profile_image_url: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});

export const getUserTimelineTool = createBaseTool({
  description:
    "Get the most recent tweets from a specific user's timeline. Returns tweets posted by the user, excluding retweets and replies by default.",
  inputSchema: z.object({
    user_identifier: z
      .string()
      .describe("Twitter username (without @) or user ID"),
    max_results: z
      .number()
      .min(5)
      .max(100)
      .default(10)
      .describe("Maximum number of tweets to return (5-100)"),
    exclude_replies: z
      .boolean()
      .default(true)
      .describe("Whether to exclude replies from the timeline"),
    exclude_retweets: z
      .boolean()
      .default(true)
      .describe("Whether to exclude retweets from the timeline"),
  }),
  outputSchema: z.object({
    tweets: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        created_at: z.string(),
        public_metrics: z.object({
          retweet_count: z.number(),
          like_count: z.number(),
          reply_count: z.number(),
          quote_count: z.number(),
        }),
        possibly_sensitive: z.boolean().optional(),
        conversation_id: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});

export const getUserFollowersTool = createBaseTool({
  description:
    "Get a list of users who are following a specific user. Returns follower profiles with basic information.",
  inputSchema: z.object({
    user_identifier: z
      .string()
      .describe("Twitter username (without @) or user ID"),
    max_results: z
      .number()
      .min(1)
      .max(1000)
      .default(100)
      .describe("Maximum number of followers to return (1-1000)"),
  }),
  outputSchema: z.object({
    followers: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        name: z.string(),
        description: z.string().optional(),
        verified: z.boolean().optional(),
        public_metrics: z.object({
          followers_count: z.number(),
          following_count: z.number(),
        }),
        profile_image_url: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});

export const getUserFollowingTool = createBaseTool({
  description:
    "Get a list of users that a specific user is following. Returns profiles of accounts they follow with basic information.",
  inputSchema: z.object({
    user_identifier: z
      .string()
      .describe("Twitter username (without @) or user ID"),
    max_results: z
      .number()
      .min(1)
      .max(1000)
      .default(100)
      .describe("Maximum number of following users to return (1-1000)"),
  }),
  outputSchema: z.object({
    following: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        name: z.string(),
        description: z.string().optional(),
        verified: z.boolean().optional(),
        public_metrics: z.object({
          followers_count: z.number(),
          following_count: z.number(),
        }),
        profile_image_url: z.string().optional(),
      }),
    ),
    next_token: z.string().optional(),
  }),
});