import { put } from "@vercel/blob";

import { differenceInHours } from "date-fns";

import { api } from "@/trpc/server";

import { generateVideo } from "@/ai/video/generate";

import type { ServerToolConfig } from "@/toolkits/types";
import type { baseGenerateTool } from "./base";
import type { videoParameters } from "../../base";
import type z from "zod";
import { IS_DEVELOPMENT } from "@/lib/constants";

export const generateToolConfigServer = ({
  model,
}: z.infer<typeof videoParameters>): ServerToolConfig<
  typeof baseGenerateTool.inputSchema.shape,
  typeof baseGenerateTool.outputSchema.shape
> => {
  return {
    callback: async ({ prompt }) => {
      if (!IS_DEVELOPMENT) {
        const {
          items: [mostRecentUserVideo],
        } = await api.videos.getUserVideos({
          limit: 1,
        });

        if (
          mostRecentUserVideo?.createdAt &&
          differenceInHours(
            new Date(),
            new Date(mostRecentUserVideo.createdAt),
          ) < 24
        ) {
          throw new Error(
            "You can only generate one video per day. If you want to generate more videos, clone the repo from https://github.com/jasonhedman/toolkit.dev and run it locally.",
          );
        }
      }

      const videoUrl = await generateVideo(model.split(":")[1]!, prompt);

      const res = await fetch(videoUrl);
      if (!res.ok) {
        console.error("Failed to fetch video from generation assets");
        throw new Error("Failed to fetch video");
      }
      const videoBlob = await res.blob();

      const videoId = crypto.randomUUID();

      const file = new File([videoBlob], `videos/${videoId}.mp4`, {
        type: "video/mp4",
      });

      const { url: videoBlobUrl } = await put(file.name, file, {
        access: "public",
      });

      await api.videos.createVideo({
        url: videoBlobUrl,
        modelId: model,
      });

      return { url: videoUrl };
    },
  };
};
