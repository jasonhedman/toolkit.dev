import { FileSearch } from "lucide-react";

import { createClientToolkit } from "@/toolkits/create-toolkit";
import { ToolkitGroups } from "@/toolkits/types";

import { baseFileRagToolkitConfig } from "./base";
import { FileRagTools } from "./tools";
import { fileRagSearchUploadedFilesToolConfigClient } from "./tools/client";

export const fileRagClientToolkit = createClientToolkit(
  baseFileRagToolkitConfig,
  {
    name: "File Search",
    description: "Search indexed PDF and image uploads.",
    icon: ({ className }) => <FileSearch className={className} />,
    form: null,
    type: ToolkitGroups.KnowledgeBase,
    envVars: [],
  },
  {
    [FileRagTools.SearchUploadedFiles]:
      fileRagSearchUploadedFilesToolConfigClient,
  },
);
