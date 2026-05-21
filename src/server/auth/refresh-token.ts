import { z } from "zod";

import { env } from "@/env";
import { db } from "@/server/db";

import type { Account } from "@prisma/client";

const REFRESH_BUFFER_SECONDS = 60;

const tokenResponseSchema = z
  .object({
    access_token: z.string(),
    expires_in: z.coerce.number().optional(),
    expires_at: z.coerce.number().optional(),
    refresh_token: z.string().optional(),
    token_type: z.string().optional(),
    scope: z.string().optional(),
  })
  .passthrough();

type RefreshConfig = {
  tokenEndpoint: string;
  clientId: string;
  clientSecret?: string;
  useBasicAuth?: boolean;
};

export async function refreshAccountAccessTokenIfNeeded(
  account: Account | null,
) {
  if (!account || !shouldRefresh(account)) {
    return account;
  }

  if (!account.refresh_token) {
    return account;
  }

  const config = getRefreshConfig(account.provider);

  if (!config) {
    return account;
  }

  const response = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: getRefreshHeaders(config),
    body: getRefreshBody(config, account.refresh_token),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to refresh ${account.provider} access token: ${response.status}`,
    );
  }

  const tokens = tokenResponseSchema.parse(await response.json());
  const expiresAt =
    tokens.expires_at ??
    (tokens.expires_in
      ? Math.floor(Date.now() / 1000 + tokens.expires_in)
      : account.expires_at);

  return db.account.update({
    where: {
      id: account.id,
    },
    data: {
      access_token: tokens.access_token,
      expires_at: expiresAt,
      refresh_token: tokens.refresh_token ?? account.refresh_token,
      token_type: tokens.token_type ?? account.token_type,
      scope: tokens.scope ?? account.scope,
    },
  });
}

function shouldRefresh(account: Account) {
  if (!account.expires_at) {
    return false;
  }

  return account.expires_at - REFRESH_BUFFER_SECONDS <= Date.now() / 1000;
}

function getRefreshHeaders(config: RefreshConfig) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (config.useBasicAuth && config.clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString("base64")}`;
  }

  return headers;
}

function getRefreshBody(config: RefreshConfig, refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  if (!config.useBasicAuth) {
    body.set("client_id", config.clientId);

    if (config.clientSecret) {
      body.set("client_secret", config.clientSecret);
    }
  }

  return body;
}

function getRefreshConfig(provider: string): RefreshConfig | null {
  switch (provider) {
    case "google":
      if (!("AUTH_GOOGLE_ID" in env && "AUTH_GOOGLE_SECRET" in env)) {
        return null;
      }

      return {
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
      };
    case "discord":
      if (!("AUTH_DISCORD_ID" in env && "AUTH_DISCORD_SECRET" in env)) {
        return null;
      }

      return {
        tokenEndpoint: "https://discord.com/api/oauth2/token",
        clientId: env.AUTH_DISCORD_ID,
        clientSecret: env.AUTH_DISCORD_SECRET,
      };
    case "github":
      if (!("AUTH_GITHUB_ID" in env && "AUTH_GITHUB_SECRET" in env)) {
        return null;
      }

      return {
        tokenEndpoint: "https://github.com/login/oauth/access_token",
        clientId: env.AUTH_GITHUB_ID,
        clientSecret: env.AUTH_GITHUB_SECRET,
      };
    case "spotify":
      if (!("AUTH_SPOTIFY_ID" in env && "AUTH_SPOTIFY_SECRET" in env)) {
        return null;
      }

      return {
        tokenEndpoint: "https://accounts.spotify.com/api/token",
        clientId: env.AUTH_SPOTIFY_ID,
        clientSecret: env.AUTH_SPOTIFY_SECRET,
        useBasicAuth: true,
      };
    case "strava":
      if (!("AUTH_STRAVA_ID" in env && "AUTH_STRAVA_SECRET" in env)) {
        return null;
      }

      return {
        tokenEndpoint: "https://www.strava.com/oauth/token",
        clientId: env.AUTH_STRAVA_ID,
        clientSecret: env.AUTH_STRAVA_SECRET,
      };
    case "twitter":
      if (!("AUTH_TWITTER_ID" in env && "AUTH_TWITTER_SECRET" in env)) {
        return null;
      }

      return {
        tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
        clientId: env.AUTH_TWITTER_ID,
        clientSecret: env.AUTH_TWITTER_SECRET,
        useBasicAuth: true,
      };
    default:
      return null;
  }
}
