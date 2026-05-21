import { ImageIcon, Sparkles, VideoIcon } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

type GenerationKind = "image" | "video";

type GenerationLoadingProps = {
  kind: GenerationKind;
  prompt?: string;
  isPartial?: boolean;
};

const previewTiles = Array.from({ length: 9 }, (_, index) => index);
const videoFrames = Array.from({ length: 5 }, (_, index) => index);
const progressSegments = Array.from({ length: 3 }, (_, index) => index);

export const GenerationLoading = ({
  kind,
  prompt,
  isPartial,
}: GenerationLoadingProps) => {
  const isVideo = kind === "video";
  const Icon = isVideo ? VideoIcon : ImageIcon;
  const trimmedPrompt = prompt?.trim();
  const promptText =
    trimmedPrompt === undefined || trimmedPrompt.length === 0
      ? "Waiting for generation details"
      : trimmedPrompt;

  return (
    <div className="border-border/70 bg-muted/30 relative w-full overflow-hidden rounded-lg border p-3">
      <div className="from-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-emerald-500/10" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className={cn(
            "border-border/70 bg-background relative shrink-0 overflow-hidden rounded-md border shadow-sm",
            isVideo ? "aspect-video w-full sm:w-40" : "aspect-square w-28",
          )}
        >
          {isVideo ? <VideoLoadingPreview /> : <ImageLoadingPreview />}
          <div className="generation-loading-sweep absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
          <div className="bg-background/70 absolute top-2 left-2 rounded-full p-1 backdrop-blur">
            <Icon className="size-3.5" />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="generation-loading-float text-primary mt-0.5 size-4" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {isPartial
                  ? "Preparing prompt"
                  : isVideo
                    ? "Rendering video"
                    : "Composing image"}
              </p>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {promptText}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
            {progressSegments.map((segment) => (
              <div
                key={segment}
                className="bg-muted h-1.5 overflow-hidden rounded-full"
              >
                <div
                  className={cn(
                    "generation-loading-pan h-full w-2/3 rounded-full",
                    isVideo ? "bg-sky-400/80" : "bg-rose-400/80",
                  )}
                  style={{ animationDelay: `${segment * 180}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageLoadingPreview = () => {
  return (
    <div className="grid h-full grid-cols-3 gap-1 p-2">
      {previewTiles.map((tile) => (
        <div
          key={tile}
          className={cn(
            "animate-pulse rounded-sm bg-gradient-to-br",
            tile % 3 === 0 && "from-rose-400/35 to-amber-300/25",
            tile % 3 === 1 && "to-primary/25 from-emerald-300/30",
            tile % 3 === 2 && "from-amber-300/30 to-rose-300/25",
          )}
          style={{ animationDelay: `${tile * 90}ms` }}
        />
      ))}
    </div>
  );
};

const VideoLoadingPreview = () => {
  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-br from-sky-400/20 via-emerald-300/15 to-amber-300/20">
      <div className="absolute inset-x-2 top-2 flex gap-1.5">
        {videoFrames.map((frame) => (
          <div
            key={frame}
            className="bg-background/60 h-10 flex-1 animate-pulse rounded-sm"
            style={{ animationDelay: `${frame * 120}ms` }}
          />
        ))}
      </div>
      <div className="absolute inset-x-2 bottom-2 flex items-end gap-1">
        {videoFrames.concat(videoFrames).map((frame, index) => (
          <div
            key={`${frame}-${index}`}
            className="bg-foreground/30 flex-1 animate-pulse rounded-full"
            style={{
              height: `${6 + (index % 5) * 3}px`,
              animationDelay: `${index * 80}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
