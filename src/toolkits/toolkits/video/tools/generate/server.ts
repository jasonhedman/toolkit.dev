import type { ServerToolConfig } from "@/toolkits/types";
import type { baseGenerateTool } from "./base";
import { put } from "@vercel/blob";
import { api } from "@/trpc/server";
import { generateVideo } from "@/ai/video/generate";

export const generateToolConfigServer = (): ServerToolConfig<
  typeof baseGenerateTool.inputSchema.shape,
  typeof baseGenerateTool.outputSchema.shape
> => {
  return {
    callback: async ({ prompt }) => {
      const generation = await generateVideo(prompt);

      let completed = false;

      while (!completed) {
        generation = await client.generations.get(generation.id);

        if (generation.state === "completed") {
          completed = true;
        } else if (generation.state === "failed") {
          throw new Error(`Generation failed: ${generation.failure_reason}`);
        } else {
          console.log("Dreaming...");
          await new Promise((r) => setTimeout(r, 3000)); // Wait for 3 seconds
        }
      }

      const videoUrl = generation.assets.video;

      const response = await fetch(videoUrl);
      const res = await fetch(video);
      if (!res.ok) {
        console.error("Failed to fetch video from generation assets");
        throw new Error("Failed to fetch video");
      }
      const videoBlob = await res.blob();

      const videoId = crypto.randomUUID();

      const file = new File([videoBlob], `videos/${videoId}.mp4`, {
        type: "video/mp4",
      });

      const { url: videoUrl } = await put(file.name, file, {
        access: "public",
      });

      await api.videos.createVideo({
        url: videoUrl,
        modelId: "ray-2",
      });

      return { url: videoUrl };
    },
  };
};
