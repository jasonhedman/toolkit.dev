import { experimental_generateImage as baseGenerateImage } from "ai";

import { imageModelRegistry } from "./registry";

import type { ImageModelProvider } from "./types";

export const generateImage = async (
  model: `${ImageModelProvider}:${string}`,
  prompt: string,
) => {
  console.log(model);
  const { image } = await baseGenerateImage({
    model: imageModelRegistry.imageModel(model),
    prompt,
  });

  return image;
};
