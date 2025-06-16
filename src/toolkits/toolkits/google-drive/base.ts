import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { GoogleDriveTools } from "./tools";
import { searchFilesTool } from "./tools/search-files/base";
import { readFileTool } from "./tools/read-file/base";

export const googleDriveParameters = z.object({});

export const baseGoogleDriveToolkitConfig: ToolkitConfig<
  GoogleDriveTools,
  typeof googleDriveParameters.shape
> = {
  tools: {
    [GoogleDriveTools.SearchFiles]: searchFilesTool,
    [GoogleDriveTools.ReadFile]: readFileTool,
  },
  parameters: googleDriveParameters,
};
