import { Video } from "lucide-react";

import { createClientToolkit } from "@/toolkits/create-toolkit";

import { ToolkitGroups } from "@/toolkits/types";

import { baseVideoToolkitConfig } from "./base";

import { VideoTools } from "./tools";

import { generateToolConfigClient } from "./tools/generate/client";

import { videoEnvVars } from "./env-vars";
import { VideoForm } from "./form";

export const videoClientToolkit = createClientToolkit(
  baseVideoToolkitConfig,
  {
    name: "Video",
    description: "Generate videos with AI",
    icon: Video,
    form: VideoForm,
    type: ToolkitGroups.Native,
    envVars: videoEnvVars,
  },
  {
    [VideoTools.Generate]: generateToolConfigClient,
  },
);
