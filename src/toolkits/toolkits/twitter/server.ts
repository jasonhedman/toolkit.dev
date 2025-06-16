import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseTwitterToolkitConfig } from "./base";
import { TwitterTools } from "./tools";
import { getTokenForProvider } from "@/trpc/get-token";
import { TwitterApi } from "twitter-api-v2";

export const twitterServerToolkit = createServerToolkit(
  baseTwitterToolkitConfig,
  async (params) => {
    const token = await getTokenForProvider("twitter");
    
    // Create Twitter API client with OAuth token
    const twitterClient = new TwitterApi(token);
    const readOnlyClient = twitterClient.readOnly;

    return {
      [TwitterTools.SearchTweets]: {
        callback: async (args) => {
          try {
            const searchResult = await readOnlyClient.v2.search(args.query, {
              max_results: args.max_results,
              sort_order: args.sort_order,
              "tweet.fields": ["created_at", "public_metrics", "possibly_sensitive", "conversation_id", "author_id"],
              "user.fields": ["username", "name", "verified"],
              expansions: ["author_id"],
            });

            const tweets = searchResult.data?.data || [];
            const users = searchResult.includes?.users || [];

            return {
              tweets: tweets.map((tweet) => {
                const author = users.find((user) => user.id === tweet.author_id);
                return {
                  id: tweet.id,
                  text: tweet.text,
                  author_username: author?.username || "",
                  author_name: author?.name || "",
                  created_at: tweet.created_at || "",
                  public_metrics: tweet.public_metrics || {
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
            throw new Error(`Failed to search tweets: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: (result) => `Found ${result.tweets.length} tweets`,
      },

      [TwitterTools.GetTweet]: {
        callback: async (args) => {
          try {
            const tweetResult = await readOnlyClient.v2.singleTweet(args.tweet_id, {
              "tweet.fields": [
                "created_at",
                "public_metrics",
                "possibly_sensitive",
                "conversation_id",
                "in_reply_to_user_id",
                "lang",
                "source",
                "author_id"
              ],
              "user.fields": ["username", "name", "verified"],
              expansions: ["author_id"],
            });

            const tweet = tweetResult.data;
            const author = tweetResult.includes?.users?.[0];

            return {
              tweet: {
                id: tweet.id,
                text: tweet.text,
                author_username: author?.username || "",
                author_name: author?.name || "",
                author_verified: author?.verified,
                created_at: tweet.created_at || "",
                public_metrics: tweet.public_metrics || {
                  retweet_count: 0,
                  like_count: 0,
                  reply_count: 0,
                  quote_count: 0,
                },
                possibly_sensitive: tweet.possibly_sensitive,
                conversation_id: tweet.conversation_id,
                in_reply_to_user_id: tweet.in_reply_to_user_id,
                lang: tweet.lang,
                source: tweet.source,
              },
            };
          } catch (error) {
            throw new Error(`Failed to get tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: "Retrieved tweet details",
      },

      [TwitterTools.GetUser]: {
        callback: async (args) => {
          try {
            const isUserId = /^\d+$/.test(args.user_identifier);
            const userResult = isUserId
              ? await readOnlyClient.v2.user(args.user_identifier, {
                  "user.fields": [
                    "created_at",
                    "description",
                    "location",
                    "url",
                    "verified",
                    "profile_image_url",
                    "public_metrics",
                    "protected"
                  ],
                })
              : await readOnlyClient.v2.userByUsername(args.user_identifier, {
                  "user.fields": [
                    "created_at",
                    "description",
                    "location",
                    "url",
                    "verified",
                    "profile_image_url",
                    "public_metrics",
                    "protected"
                  ],
                });

            const user = userResult.data;

            return {
              user: {
                id: user.id,
                username: user.username,
                name: user.name,
                description: user.description,
                location: user.location,
                url: user.url,
                verified: user.verified,
                created_at: user.created_at || "",
                profile_image_url: user.profile_image_url,
                public_metrics: user.public_metrics || {
                  followers_count: 0,
                  following_count: 0,
                  tweet_count: 0,
                  listed_count: 0,
                },
                protected: user.protected,
              },
            };
          } catch (error) {
            throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: (result) => `Retrieved user: @${result.user.username}`,
      },

      [TwitterTools.SearchUsers]: {
        callback: async (args) => {
          // Twitter API v2 doesn't have a direct user search endpoint
          throw new Error("User search is not available in Twitter API v2. Consider using tweet search to find users by their tweets.");
        },
        message: (result) => `Found ${result.users.length} users`,
      },

      [TwitterTools.GetUserTimeline]: {
        callback: async (args) => {
          try {
            const isUserId = /^\d+$/.test(args.user_identifier);
            let userId = args.user_identifier;

            if (!isUserId) {
              const userResult = await readOnlyClient.v2.userByUsername(args.user_identifier);
              userId = userResult.data.id;
            }

            const timelineResult = await readOnlyClient.v2.userTimeline(userId, {
              max_results: args.max_results,
              exclude: [
                ...(args.exclude_replies ? ["replies"] : []),
                ...(args.exclude_retweets ? ["retweets"] : []),
              ] as ("replies" | "retweets")[],
              "tweet.fields": ["created_at", "public_metrics", "possibly_sensitive", "conversation_id"],
            });

            const tweets = timelineResult.data?.data || [];

            return {
              tweets: tweets.map((tweet) => ({
                id: tweet.id,
                text: tweet.text,
                created_at: tweet.created_at || "",
                public_metrics: tweet.public_metrics || {
                  retweet_count: 0,
                  like_count: 0,
                  reply_count: 0,
                  quote_count: 0,
                },
                possibly_sensitive: tweet.possibly_sensitive,
                conversation_id: tweet.conversation_id,
              })),
              next_token: timelineResult.meta?.next_token,
            };
          } catch (error) {
            throw new Error(`Failed to get user timeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: (result) => `Retrieved ${result.tweets.length} tweets from timeline`,
      },

      [TwitterTools.GetUserFollowers]: {
        callback: async (args) => {
          try {
            const isUserId = /^\d+$/.test(args.user_identifier);
            let userId = args.user_identifier;

            if (!isUserId) {
              const userResult = await readOnlyClient.v2.userByUsername(args.user_identifier);
              userId = userResult.data.id;
            }

            const followersResult = await readOnlyClient.v2.followers(userId, {
              max_results: args.max_results,
              "user.fields": ["description", "verified", "public_metrics", "profile_image_url"],
            });

            const followers = followersResult.data?.data || [];

            return {
              followers: followers.map((user) => ({
                id: user.id,
                username: user.username,
                name: user.name,
                description: user.description,
                verified: user.verified,
                public_metrics: {
                  followers_count: user.public_metrics?.followers_count || 0,
                  following_count: user.public_metrics?.following_count || 0,
                },
                profile_image_url: user.profile_image_url,
              })),
              next_token: followersResult.meta?.next_token,
            };
          } catch (error) {
            throw new Error(`Failed to get followers: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: (result) => `Retrieved ${result.followers.length} followers`,
      },

      [TwitterTools.GetUserFollowing]: {
        callback: async (args) => {
          try {
            const isUserId = /^\d+$/.test(args.user_identifier);
            let userId = args.user_identifier;

            if (!isUserId) {
              const userResult = await readOnlyClient.v2.userByUsername(args.user_identifier);
              userId = userResult.data.id;
            }

            const followingResult = await readOnlyClient.v2.following(userId, {
              max_results: args.max_results,
              "user.fields": ["description", "verified", "public_metrics", "profile_image_url"],
            });

            const following = followingResult.data?.data || [];

            return {
              following: following.map((user) => ({
                id: user.id,
                username: user.username,
                name: user.name,
                description: user.description,
                verified: user.verified,
                public_metrics: {
                  followers_count: user.public_metrics?.followers_count || 0,
                  following_count: user.public_metrics?.following_count || 0,
                },
                profile_image_url: user.profile_image_url,
              })),
              next_token: followingResult.meta?.next_token,
            };
          } catch (error) {
            throw new Error(`Failed to get following: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: (result) => `Retrieved ${result.following.length} following`,
      },

      [TwitterTools.GetTweetLikedBy]: {
        callback: async (args) => {
          try {
            const likesResult = await readOnlyClient.v2.tweetLikedBy(args.tweet_id, {
              max_results: args.max_results,
              "user.fields": ["description", "verified", "public_metrics", "profile_image_url"],
            });

            const users = likesResult.data?.data || [];

            return {
              users: users.map((user) => ({
                id: user.id,
                username: user.username,
                name: user.name,
                description: user.description,
                verified: user.verified,
                public_metrics: {
                  followers_count: user.public_metrics?.followers_count || 0,
                  following_count: user.public_metrics?.following_count || 0,
                  tweet_count: user.public_metrics?.tweet_count || 0,
                },
                profile_image_url: user.profile_image_url,
              })),
              next_token: likesResult.meta?.next_token,
            };
          } catch (error) {
            throw new Error(`Failed to get users who liked tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: (result) => `Retrieved ${result.users.length} users who liked the tweet`,
      },

      [TwitterTools.GetTweetRetweetedBy]: {
        callback: async (args) => {
          try {
            const retweetsResult = await readOnlyClient.v2.tweetRetweetedBy(args.tweet_id, {
              max_results: args.max_results,
              "user.fields": ["description", "verified", "public_metrics", "profile_image_url"],
            });

            const users = retweetsResult.data?.data || [];

            return {
              users: users.map((user) => ({
                id: user.id,
                username: user.username,
                name: user.name,
                description: user.description,
                verified: user.verified,
                public_metrics: {
                  followers_count: user.public_metrics?.followers_count || 0,
                  following_count: user.public_metrics?.following_count || 0,
                  tweet_count: user.public_metrics?.tweet_count || 0,
                },
                profile_image_url: user.profile_image_url,
              })),
              next_token: retweetsResult.meta?.next_token,
            };
          } catch (error) {
            throw new Error(`Failed to get users who retweeted: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        message: (result) => `Retrieved ${result.users.length} users who retweeted`,
      },
    };
  }
);