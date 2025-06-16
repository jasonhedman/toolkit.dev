import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseImageToolkitConfig } from "./base";
import { generateToolConfigServer } from "./tools/generate/server";
import { ImageTools } from "./tools/tools";

export const imageToolkitServer = createServerToolkit(
  baseImageToolkitConfig,
  `You have access to the Image toolkit for AI-powered image generation. This toolkit contains:

- **Generate**: Create high-quality images from text descriptions using advanced AI models

**Usage Guidelines:**
1. Use detailed, descriptive prompts for better image quality
2. Include style specifications (e.g., "photorealistic", "digital art", "cartoon style")
3. Specify composition details (e.g., "close-up", "wide shot", "bird's eye view")
4. Consider lighting and mood descriptions for enhanced results
5. For multiple related images, maintain consistent style and theme across generations

This tool is perfect for creating visual content, illustrations, concept art, and any visual materials needed for your projects.`,
  async (parameters) => {
    return {
      [ImageTools.Generate]: generateToolConfigServer(parameters),
    };
  },
);
