import { experimental_generateImage as baseGenerateImage } from "ai";

import { imageModelRegistry } from "./registry";

import type { ImageModelProvider } from "./types";

export const generateImage = async (
  model: `${ImageModelProvider}:${string}`,
  prompt: string,
) => {
  // Get the provider from the registry
  const [provider] = model.split(':');
  const providerModel = imageModelRegistry[provider as keyof typeof imageModelRegistry];
  
  const { image } = await baseGenerateImage({
    model: providerModel as any,
    prompt,
  });

  return image;
};
