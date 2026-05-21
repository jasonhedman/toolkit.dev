import { z } from "zod";

import { createBaseTool } from "@/toolkits/create-tool";

export const searchUploadedFilesTool = createBaseTool({
  description:
    "Search indexed uploaded PDF and image files using vector retrieval.",
  inputSchema: z.object({
    query: z.string().describe("Search query for the uploaded files"),
    limit: z
      .number()
      .min(1)
      .max(10)
      .optional()
      .describe("Maximum number of chunks to return. Defaults to 5."),
    fileIds: z
      .array(z.string())
      .optional()
      .describe("Optional file IDs to restrict retrieval to specific files."),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(
      z.object({
        chunkId: z.string(),
        fileId: z.string(),
        fileName: z.string(),
        contentType: z.string(),
        chunkIndex: z.number(),
        content: z.string(),
        score: z.number(),
      }),
    ),
  }),
});
