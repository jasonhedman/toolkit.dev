import { createServerToolkit } from "@/toolkits/create-toolkit";

import { baseVideoToolkitConfig } from "./base";
import { VideoTools } from "./tools";

import { generateToolConfigServer } from "./tools/generate/server";

export const videoToolkitServer = createServerToolkit(
  baseVideoToolkitConfig,
  `You have access to the comprehensive video toolkit for video generation. This toolkit provides:

- **Video Generation** - Generate videos with AI`,
  async (parameters) => {
    return {
      [VideoTools.Generate]: generateToolConfigServer(parameters),
    };
  },
);
