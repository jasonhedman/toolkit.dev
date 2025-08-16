import type { ImageModelProvider } from "./types";

export type GeneratedImage = {
  uint8Array: Uint8Array;
  mimeType: string;
};

export const generateImage = async (
  _model: `${ImageModelProvider}:${string}`,
  _prompt: string,
): Promise<GeneratedImage> => {
  throw new Error(
    "Image generation is not configured in this build. Please set provider keys and implement a v5-compatible image generation path.",
  );
};
