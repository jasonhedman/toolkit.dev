import { env } from "@/env";

import DiscordProvider, {
  type DiscordProfile,
} from "next-auth/providers/discord";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import GithubProvider, { type GitHubProfile } from "next-auth/providers/github";
import TwitterProvider, {
  type TwitterProfile,
} from "next-auth/providers/twitter";
import NotionProvider, { type NotionProfile } from "next-auth/providers/notion";

import type {
  OAuthConfig,
} from "next-auth/providers";

// Custom Strava provider profile type
interface StravaProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profile: string;
  profile_medium: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
}

// Strava provider using proper NextAuth OAuth flow
const StravaProvider = (options: { clientId: string; clientSecret: string }): OAuthConfig<StravaProfile> => {
  return {
    id: "strava",
    name: "Strava",
    type: "oauth",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorization: {
      url: "https://www.strava.com/oauth/authorize",
      params: {
        scope: "read,activity:read_all",
        response_type: "code",
      },
    },
    token: "https://www.strava.com/oauth/token",
    userinfo: "https://www.strava.com/api/v3/athlete",
    profile(profile: StravaProfile) {
      return {
        id: profile.id.toString(),
        name: `${profile.firstname} ${profile.lastname}`,
        email: profile.email || null,
        image: profile.profile || profile.profile_medium || null,
      };
    },
    style: {
      logo: "https://developers.strava.com/images/strava_logo_orange.svg",
      bg: "#fc4c02",
      text: "#fff",
    },
    allowDangerousEmailAccountLinking: true,
  };
};

export const providers: (
  | OAuthConfig<DiscordProfile>
  | OAuthConfig<GoogleProfile>
  | OAuthConfig<GitHubProfile>
  | OAuthConfig<TwitterProfile>
  | OAuthConfig<NotionProfile>
  | OAuthConfig<StravaProfile>
)[] = [
  ...("AUTH_DISCORD_ID" in env && "AUTH_DISCORD_SECRET" in env
    ? [
        DiscordProvider({
          clientId: env.AUTH_DISCORD_ID,
          clientSecret: env.AUTH_DISCORD_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...("AUTH_GOOGLE_ID" in env && "AUTH_GOOGLE_SECRET" in env
    ? [
        GoogleProvider({
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...("AUTH_GITHUB_ID" in env && "AUTH_GITHUB_SECRET" in env
    ? [
        GithubProvider({
          clientId: env.AUTH_GITHUB_ID,
          clientSecret: env.AUTH_GITHUB_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...("AUTH_TWITTER_ID" in env && "AUTH_TWITTER_SECRET" in env
    ? [
        TwitterProvider({
          clientId: env.AUTH_TWITTER_ID,
          clientSecret: env.AUTH_TWITTER_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...("AUTH_NOTION_ID" in env && "AUTH_NOTION_SECRET" in env
    ? [
        NotionProvider({
          clientId: env.AUTH_NOTION_ID,
          clientSecret: env.AUTH_NOTION_SECRET,
          redirectUri: `${env.NEXTAUTH_URL}/api/auth/callback/notion`,
          token: {
            conform: async (response: Response) => {
              const body = (await response.json()) as {
                refresh_token?: string;
              };
              if (body?.refresh_token === null) {
                delete body.refresh_token;
              }
              return new Response(JSON.stringify(body), response);
            },
          },
        }),
      ]
    : []),
  ...("AUTH_STRAVA_ID" in env && "AUTH_STRAVA_SECRET" in env
    ? [
        StravaProvider({
          clientId: env.AUTH_STRAVA_ID,
          clientSecret: env.AUTH_STRAVA_SECRET,
        }),
      ]
    : []),
];
