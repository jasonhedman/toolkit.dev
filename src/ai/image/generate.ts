import { experimental_generateImage as sdkGenerateImage } from "ai";
import type { ImageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { fal } from "@ai-sdk/fal";
import { fireworks } from "@ai-sdk/fireworks";
import { luma } from "@ai-sdk/luma";

/**
 * Maps provider id to a function that returns a configured image model factory.
 * We only support providers that are installed. Extend here to add more.
 */
type ImageModelFactory = (model: string) => ImageModel; // SDK returns model descriptor
const providerMap: Record<string, ImageModelFactory> = {
  openai: (m: string) => openai.image(m),
  xai: (m: string) => xai.image(m),
  fal: (m: string) => fal.image(m),
  fireworks: (m: string) => fireworks.image(m),
  luma: (m: string) => luma.image(m),
};

/**
 * Generates a single image using the Vercel AI SDK v5 experimental image API.
 * Keeps a minimal return shape expected by the image toolkit server tool.
 */
export type GenerateImageResult = Awaited<ReturnType<typeof sdkGenerateImage>>;

export async function generateImage(model: string, prompt: string): Promise<GenerateImageResult> {
  const [provider, providerModel] = model.split(":");
  if (!provider || !providerModel) {
    throw new Error("Image model must be in '<provider>:<model>' format");
  }
  const factory = providerMap[provider];
  if (!factory) throw new Error(`Unsupported image provider: ${provider}`);
  return sdkGenerateImage({
    model: factory(providerModel),
    prompt,
  });
}
