import { type searchUploadedFilesTool } from "./base";
import { searchIndexedFileChunks } from "@/server/rag/files";

import type { ServerToolConfig } from "@/toolkits/types";

export const fileRagSearchUploadedFilesToolConfigServer = (
  userId: string,
): ServerToolConfig<
  typeof searchUploadedFilesTool.inputSchema.shape,
  typeof searchUploadedFilesTool.outputSchema.shape
> => ({
  callback: async ({ query, limit, fileIds }) => {
    const results = await searchIndexedFileChunks({
      userId,
      query,
      limit,
      fileIds,
    });

    return {
      query,
      results,
    };
  },
  message: (result) =>
    result.results.length > 0
      ? "These are the most relevant indexed file chunks. Use them to answer the user and cite the file names when useful."
      : "No indexed file chunks matched the query. Ask the user to upload and index relevant files if needed.",
});
