import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { NotionTools } from "./tools";
import {
  listDatabasesTool,
  queryDatabaseTool,
  createDatabaseTool,
  getPageTool,
  searchPagesTool,
  createPageTool,
  getBlocksTool,
  appendBlocksTool,
  listUsersTool,
} from "./tools";

export const notionParameters = z.object({});

export const baseNotionToolkitConfig: ToolkitConfig<
  NotionTools,
  typeof notionParameters.shape
> = {
  tools: {
    [NotionTools.ListDatabases]: listDatabasesTool,
    [NotionTools.QueryDatabase]: queryDatabaseTool,
    [NotionTools.CreateDatabase]: createDatabaseTool,
    [NotionTools.GetPage]: getPageTool,
    [NotionTools.SearchPages]: searchPagesTool,
    [NotionTools.CreatePage]: createPageTool,
    [NotionTools.GetBlocks]: getBlocksTool,
    [NotionTools.AppendBlocks]: appendBlocksTool,
    [NotionTools.ListUsers]: listUsersTool,
  },
  parameters: notionParameters,
};
