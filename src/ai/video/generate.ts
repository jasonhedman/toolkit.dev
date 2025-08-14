import LumaAI from "lumaai";

import type { allVideoModels } from ".";

export const generateVideo = async (
  modelId: (typeof allVideoModels)[number]["modelId"],
  prompt: string,
): Promise<string> => {
  const apiKey = process.env.LUMA_API_KEY;
  if (!apiKey) {
    throw new Error("LUMA_API_KEY environment variable is not set");
  }

  const client = new LumaAI({ authToken: apiKey });

  let generation = await client.generations.create({
    prompt: prompt,
    model: modelId as "ray-flash-2" | "ray-2",
  });

  // Poll until complete or failed
  while (generation.state !== "completed") {
    if (generation.state === "failed") {
      throw new Error(`Generation failed: ${generation.failure_reason}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
    if (generation.id != null) {
      generation = await client.generations.get(generation.id);
    }
  }

  // Download the resulting video
  const videoUrl = generation.assets?.video;

  if (!videoUrl) {
    throw new Error("No video URL found");
  }

  return videoUrl;
};
