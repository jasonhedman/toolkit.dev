import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseTwitterToolkitConfig } from "./base";
import { TwitterTools } from "./tools";
import { getTokenForProvider } from "@/trpc/get-token";

export const twitterServerToolkit = createServerToolkit(
  baseTwitterToolkitConfig,
  async (params) => {
    const token = await getTokenForProvider("twitter");
    
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    return {
      [TwitterTools.SearchTweets]: {
        callback: async (args) => {
          const searchParams = new URLSearchParams({
            query: args.query,
            max_results: args.max_results.toString(),
            sort_order: args.sort_order,
            "tweet.fields": "created_at,public_metrics,possibly_sensitive,conversation_id,author_id",
            "user.fields": "username,name,verified",
            expansions: "author_id",
          });

          const response = await fetch(
            `https://api.x.com/2/tweets/search/recent?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            tweets: data.data?.map((tweet: any) => {
              const author = data.includes?.users?.find((user: any) => user.id === tweet.author_id);
              return {
                id: tweet.id,
                text: tweet.text,
                author_username: author?.username || "",
                author_name: author?.name || "",
                created_at: tweet.created_at,
                public_metrics: tweet.public_metrics,
                possibly_sensitive: tweet.possibly_sensitive,
                conversation_id: tweet.conversation_id,
              };
            }) || [],
            next_token: data.meta?.next_token,
          };
        },
        message: (result) => `Found ${result.tweets.length} tweets`,
      },

      [TwitterTools.GetTweet]: {
        callback: async (args) => {
          const searchParams = new URLSearchParams({
            "tweet.fields": "created_at,public_metrics,possibly_sensitive,conversation_id,in_reply_to_user_id,lang,source,author_id",
            "user.fields": "username,name,verified",
            expansions: "author_id",
          });

          const response = await fetch(
            `https://api.x.com/2/tweets/${args.tweet_id}?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Tweet not found or Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          const author = data.includes?.users?.[0];
          
          return {
            tweet: {
              id: data.data.id,
              text: data.data.text,
              author_username: author?.username || "",
              author_name: author?.name || "",
              author_verified: author?.verified,
              created_at: data.data.created_at,
              public_metrics: data.data.public_metrics,
              possibly_sensitive: data.data.possibly_sensitive,
              conversation_id: data.data.conversation_id,
              in_reply_to_user_id: data.data.in_reply_to_user_id,
              lang: data.data.lang,
              source: data.data.source,
            },
          };
        },
        message: "Retrieved tweet details",
      },

      [TwitterTools.GetUser]: {
        callback: async (args) => {
          const isUserId = /^\d+$/.test(args.user_identifier);
          const endpoint = isUserId 
            ? `https://api.x.com/2/users/${args.user_identifier}`
            : `https://api.x.com/2/users/by/username/${args.user_identifier}`;

          const searchParams = new URLSearchParams({
            "user.fields": "created_at,description,location,url,verified,profile_image_url,public_metrics,protected",
          });

          const response = await fetch(
            `${endpoint}?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`User not found or Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            user: {
              id: data.data.id,
              username: data.data.username,
              name: data.data.name,
              description: data.data.description,
              location: data.data.location,
              url: data.data.url,
              verified: data.data.verified,
              created_at: data.data.created_at,
              profile_image_url: data.data.profile_image_url,
              public_metrics: data.data.public_metrics,
              protected: data.data.protected,
            },
          };
        },
        message: (result) => `Retrieved user: @${result.user.username}`,
      },

      [TwitterTools.SearchUsers]: {
        callback: async (args) => {
          const searchParams = new URLSearchParams({
            query: args.query,
            max_results: args.max_results.toString(),
            "user.fields": "description,location,verified,public_metrics,profile_image_url",
          });

          // Note: Twitter API v2 doesn't have a direct user search endpoint
          // This would need to be implemented using a different approach
          // For now, we'll return a placeholder response
          throw new Error("User search is not available in Twitter API v2. Consider using tweet search to find users by their tweets.");
        },
        message: (result) => `Found ${result.users.length} users`,
      },

      [TwitterTools.GetUserTimeline]: {
        callback: async (args) => {
          const isUserId = /^\d+$/.test(args.user_identifier);
          let userId = args.user_identifier;
          
          if (!isUserId) {
            // First get user ID from username
            const userResponse = await fetch(
              `https://api.x.com/2/users/by/username/${args.user_identifier}`,
              { headers }
            );
            
            if (!userResponse.ok) {
              throw new Error(`User not found: ${args.user_identifier}`);
            }
            
            const userData = await userResponse.json();
            userId = userData.data.id;
          }

          const searchParams = new URLSearchParams({
            max_results: args.max_results.toString(),
            exclude: [
              ...(args.exclude_replies ? ["replies"] : []),
              ...(args.exclude_retweets ? ["retweets"] : []),
            ].join(","),
            "tweet.fields": "created_at,public_metrics,possibly_sensitive,conversation_id",
          });

          const response = await fetch(
            `https://api.x.com/2/users/${userId}/tweets?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Timeline not accessible or Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            tweets: data.data?.map((tweet: any) => ({
              id: tweet.id,
              text: tweet.text,
              created_at: tweet.created_at,
              public_metrics: tweet.public_metrics,
              possibly_sensitive: tweet.possibly_sensitive,
              conversation_id: tweet.conversation_id,
            })) || [],
            next_token: data.meta?.next_token,
          };
        },
        message: (result) => `Retrieved ${result.tweets.length} tweets from timeline`,
      },

      [TwitterTools.GetUserFollowers]: {
        callback: async (args) => {
          const isUserId = /^\d+$/.test(args.user_identifier);
          let userId = args.user_identifier;
          
          if (!isUserId) {
            const userResponse = await fetch(
              `https://api.x.com/2/users/by/username/${args.user_identifier}`,
              { headers }
            );
            
            if (!userResponse.ok) {
              throw new Error(`User not found: ${args.user_identifier}`);
            }
            
            const userData = await userResponse.json();
            userId = userData.data.id;
          }

          const searchParams = new URLSearchParams({
            max_results: args.max_results.toString(),
            "user.fields": "description,verified,public_metrics,profile_image_url",
          });

          const response = await fetch(
            `https://api.x.com/2/users/${userId}/followers?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Cannot access followers or Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            followers: data.data?.map((user: any) => ({
              id: user.id,
              username: user.username,
              name: user.name,
              description: user.description,
              verified: user.verified,
              public_metrics: {
                followers_count: user.public_metrics.followers_count,
                following_count: user.public_metrics.following_count,
              },
              profile_image_url: user.profile_image_url,
            })) || [],
            next_token: data.meta?.next_token,
          };
        },
        message: (result) => `Retrieved ${result.followers.length} followers`,
      },

      [TwitterTools.GetUserFollowing]: {
        callback: async (args) => {
          const isUserId = /^\d+$/.test(args.user_identifier);
          let userId = args.user_identifier;
          
          if (!isUserId) {
            const userResponse = await fetch(
              `https://api.x.com/2/users/by/username/${args.user_identifier}`,
              { headers }
            );
            
            if (!userResponse.ok) {
              throw new Error(`User not found: ${args.user_identifier}`);
            }
            
            const userData = await userResponse.json();
            userId = userData.data.id;
          }

          const searchParams = new URLSearchParams({
            max_results: args.max_results.toString(),
            "user.fields": "description,verified,public_metrics,profile_image_url",
          });

          const response = await fetch(
            `https://api.x.com/2/users/${userId}/following?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Cannot access following list or Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            following: data.data?.map((user: any) => ({
              id: user.id,
              username: user.username,
              name: user.name,
              description: user.description,
              verified: user.verified,
              public_metrics: {
                followers_count: user.public_metrics.followers_count,
                following_count: user.public_metrics.following_count,
              },
              profile_image_url: user.profile_image_url,
            })) || [],
            next_token: data.meta?.next_token,
          };
        },
        message: (result) => `Retrieved ${result.following.length} following`,
      },

      [TwitterTools.GetTweetLikedBy]: {
        callback: async (args) => {
          const searchParams = new URLSearchParams({
            max_results: args.max_results.toString(),
            "user.fields": "description,verified,public_metrics,profile_image_url",
          });

          const response = await fetch(
            `https://api.x.com/2/tweets/${args.tweet_id}/liking_users?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Cannot access likes data or Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            users: data.data?.map((user: any) => ({
              id: user.id,
              username: user.username,
              name: user.name,
              description: user.description,
              verified: user.verified,
              public_metrics: {
                followers_count: user.public_metrics.followers_count,
                following_count: user.public_metrics.following_count,
                tweet_count: user.public_metrics.tweet_count,
              },
              profile_image_url: user.profile_image_url,
            })) || [],
            next_token: data.meta?.next_token,
          };
        },
        message: (result) => `Retrieved ${result.users.length} users who liked the tweet`,
      },

      [TwitterTools.GetTweetRetweetedBy]: {
        callback: async (args) => {
          const searchParams = new URLSearchParams({
            max_results: args.max_results.toString(),
            "user.fields": "description,verified,public_metrics,profile_image_url",
          });

          const response = await fetch(
            `https://api.x.com/2/tweets/${args.tweet_id}/retweeted_by?${searchParams}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Cannot access retweets data or Twitter API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          return {
            users: data.data?.map((user: any) => ({
              id: user.id,
              username: user.username,
              name: user.name,
              description: user.description,
              verified: user.verified,
              public_metrics: {
                followers_count: user.public_metrics.followers_count,
                following_count: user.public_metrics.following_count,
                tweet_count: user.public_metrics.tweet_count,
              },
              profile_image_url: user.profile_image_url,
            })) || [],
            next_token: data.meta?.next_token,
          };
        },
        message: (result) => `Retrieved ${result.users.length} users who retweeted`,
      },
    };
  }
);