import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

// Exa is the fastest and most accurate web search API for AI
export const baseSearchTool = createBaseTool({
  description: "Search the web for up-to-date information using Exa",
  inputSchema: z.object({
    query: z.string().min(1).max(100),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string().nullable(),
        url: z.string().url(),
        content: z.string(),
        publishedDate: z.string().optional(),
        image: z.string().optional(),
        favicon: z.string().optional(),
        score: z.number().optional(),
        author: z.string().optional(),
      }),
    ),
  }),
});
