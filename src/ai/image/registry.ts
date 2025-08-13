import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { fireworks } from "@ai-sdk/fireworks";
import { fal } from "@ai-sdk/fal";
import { luma } from "@ai-sdk/luma";

// Minimal routing registry to avoid ProviderV2 typing across mixed provider versions
export const imageModelRegistry = {
  imageModel(id: string) {
    const [provider, ...rest] = id.split(":");
    const modelId = rest.join(":");
    switch (provider) {
      case "openai":
        return openai.image(modelId);
      case "xai":
        return xai.image(modelId);
      case "fireworks":
        return fireworks.image(modelId);
      case "fal":
        return fal.image(modelId);
      case "luma":
        return luma.image(modelId);
      default:
        throw new Error(`Unknown image provider: ${provider}`);
    }
  },
};
