import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";

export const getPlaylistsBase = createBaseTool({
  description: "Get the user's Spotify playlists.",
  inputSchema: z.object({
    limit: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .describe(
        "The maximum number of items to return. Default: 20. Min: 1. Max: 50.",
      ),
    offset: z
      .number()
      .min(0)
      .optional()
      .describe("The index of the first playlist to return. Default: 0."),
  }),
  outputSchema: z.object({
    playlists: z.array(z.custom<SimplifiedPlaylist>()),
  }),
});
