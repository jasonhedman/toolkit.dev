import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { baseSpotifyToolkitConfig } from "./base";
import { SpotifyTools } from "./tools";
import { createServerToolkit } from "../../create-toolkit";
import { getPlaylistsToolConfigServer } from "./tools/playlists/server";
import { getTracksToolConfigServer } from "./tools/tracks/server";
import { api } from "@/trpc/server";
import { env } from "@/env";

export const spotifyToolkitServer = createServerToolkit(
  baseSpotifyToolkitConfig,
  `You have access to the Spotify toolkit for music discovery and playlist management. This toolkit provides:
- **Get Playlists**: Retrieve the user's Spotify playlists with metadata
- **Get Tracks**: Retrieve the user's saved tracks with detailed information
**Tool Sequencing Workflows:**
1. **Playlist Discovery**: Use Get Playlists to explore the user's music collection
2. **Track Analysis**: Use Get Tracks to analyze the user's saved tracks and music preferences
3. **Music Recommendations**: Use playlist and track data to suggest similar music or create new playlists
**Best Practices:**
- Start with Get Playlists to understand the user's music taste
- Use Get Tracks to analyze individual song preferences
- Use appropriate limits and offsets for pagination when dealing with many items
- Consider the user's privacy and only access data they've explicitly shared
- Provide context about genres, moods, and themes when analyzing music preferences`,
  async () => {
    const account = await api.accounts.getAccountByProvider("spotify");

    if (!account) {
      throw new Error("No Spotify account found");
    }
    if (!account.access_token) {
      throw new Error("No Spotify access token found");
    }

    // Create Spotify API instance with user's access token
    const spotify = SpotifyApi.withAccessToken(env.AUTH_SPOTIFY_ID, {
      access_token: account.access_token,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: account.refresh_token ?? "",
    });

    return {
      [SpotifyTools.GetPlaylists]: getPlaylistsToolConfigServer(spotify),
      [SpotifyTools.GetTracks]: getTracksToolConfigServer(spotify),
    };
  },
);
