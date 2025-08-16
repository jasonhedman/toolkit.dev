import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getPlaylistsBase } from "@/toolkits/toolkits/spotify/tools/playlists/base";
import { Music } from "lucide-react";
import { ToolCallDisplay } from "../../components/tool-call-display";

export const getPlaylistsToolConfigClient: ClientToolConfig<
  typeof getPlaylistsBase.inputSchema.shape,
  typeof getPlaylistsBase.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    return (
      <ToolCallDisplay
        icon={Music}
        label="Get Playlists"
        value={`Fetching ${limit} playlists (offset: ${offset})...`}
      />
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.playlists.length) {
      return <div className="text-muted-foreground">No playlists found</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Your Spotify Playlists
        </h1>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
              onClick={() => {
                void append({ text: `Tell me more about the playlist "${playlist.name}"` });
              }}
            >
              <div className="flex items-center space-x-3">
                {playlist.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-md">
                    <Music className="text-muted-foreground h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">
                    {playlist.name}
                  </h3>
                  <a
                    href={playlist.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary text-xs transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in Spotify
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
