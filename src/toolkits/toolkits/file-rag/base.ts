import { z } from "zod";

import type { ToolkitConfig } from "@/toolkits/types";

import { FileRagTools } from "./tools";
import { searchUploadedFilesTool } from "./tools/search-uploaded-files/base";

export const fileRagParameters = z.object({});

export const baseFileRagToolkitConfig: ToolkitConfig<
  FileRagTools,
  typeof fileRagParameters.shape
> = {
  tools: {
    [FileRagTools.SearchUploadedFiles]: searchUploadedFilesTool,
  },
  parameters: fileRagParameters,
};
