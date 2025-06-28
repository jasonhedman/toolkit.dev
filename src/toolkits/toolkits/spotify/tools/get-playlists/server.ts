// src/toolkits/toolkits/spotify/tools/get-playlists/server.ts
//TODO: Implement the actual server tool for the GetPlaylists tool
import { getPlaylistsBase } from "./base";
import type { z } from "zod";
import type { ServerToolConfig } from "@/toolkits/types";

// Helper to fetch playlists from Spotify API
async function fetchSpotifyPlaylists(accessToken: string, limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.append("limit", limit.toString());
  if (offset !== undefined) params.append("offset", offset.toString());
  const url = `https://api.spotify.com/v1/me/playlists?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch playlists from Spotify");
  const data = await res.json();
  return data.items.map((playlist: any) => ({
    id: playlist.id,
    name: playlist.name,
    url: playlist.external_urls.spotify,
    image: playlist.images?.[0]?.url,
  }));
}

export const getPlaylistsServer: ServerToolConfig<
  typeof getPlaylistsBase.inputSchema.shape,
  typeof getPlaylistsBase.outputSchema.shape
> = {
  callback: async (input) => {
    // TODO: Replace with real access token retrieval logic
    // e.g., get from session, context, or input
    const accessToken = (globalThis as any).spotifyAccessToken;
    if (!accessToken) throw new Error("No Spotify access token found for user");

    const limit = input.limit ?? 20;
    const offset = input.offset ?? 0;
    const playlists = await fetchSpotifyPlaylists(accessToken, limit, offset);
    return { playlists };
  },
};