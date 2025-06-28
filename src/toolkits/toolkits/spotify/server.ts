// src/toolkits/toolkits/spotify/server.ts
//TODO: Implement the actual server tool for the GetPlaylists tool
import { spotifyToolkitBase } from "./base";
import { tools } from "./tools/server";
import { createServerToolkit } from "../../create-toolkit";

export const spotifyToolkit = createServerToolkit(
  {
    ...spotifyToolkitBase,
    tools: {
      getPlaylists: tools.getPlaylists.base,
    },
  },
  "You can use this toolkit to access the user's Spotify playlists.",
  async (_params) => ({
    getPlaylists: tools.getPlaylists.server,
  })
);