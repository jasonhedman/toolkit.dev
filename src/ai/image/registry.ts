import { createProviderRegistry } from "ai";

import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { fireworks } from "@ai-sdk/fireworks";
import { fal } from "@ai-sdk/fal";
import { luma } from "@ai-sdk/luma";

// TODO: Update provider registry for AI SDK v5
// The createProviderRegistry function has changed in v5
// For now, we'll export individual providers
export const imageProviders = {
  openai,
  xai,
  fireworks,
  fal,
  luma,
};

// Legacy export for compatibility
export const imageModelRegistry = imageProviders;
