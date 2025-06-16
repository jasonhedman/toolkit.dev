export enum NotionTools {
  ListDatabases = "list-databases",
  QueryDatabase = "query-database",
  CreateDatabase = "create-database",
  GetPage = "get-page",
  SearchPages = "search-pages",
  CreatePage = "create-page",
  GetBlocks = "get-blocks",
  AppendBlocks = "append-blocks",
  ListUsers = "list-users",
}

export {
  listDatabasesTool,
  queryDatabaseTool,
  createDatabaseTool,
} from "./databases/base";
export { getPageTool, searchPagesTool, createPageTool } from "./pages/base";
export { getBlocksTool, appendBlocksTool } from "./blocks/base";
export { listUsersTool } from "./users/base";
