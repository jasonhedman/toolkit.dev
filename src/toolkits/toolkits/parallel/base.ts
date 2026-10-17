import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const httpUrl = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  }, "Use an HTTP or HTTPS URL without credentials");

export enum ParallelTools {
  Search = "search",
  Fetch = "fetch",
}

export const parallelParameters = z.object({});

export const parallelOutput = z.object({
  results: z.array(
    z.object({
      title: z.string().nullable(),
      url: httpUrl,
      content: z.string(),
      publishedDate: z.string().optional(),
    }),
  ),
  warnings: z.array(z.string()),
});

export const baseParallelToolkitConfig = {
  parameters: parallelParameters,
  tools: {
    [ParallelTools.Search]: createBaseTool({
      description:
        "Search the web for current information. Use the returned excerpts to answer and cite the source URLs.",
      inputSchema: z.object({
        objective: z.string().trim().min(1).max(1000),
        queries: z.array(z.string().trim().min(1).max(200)).min(1).max(5),
      }),
      outputSchema: parallelOutput,
    }),
    [ParallelTools.Fetch]: createBaseTool({
      description:
        "Read specific web pages when the user provides a URL or search excerpts are insufficient.",
      inputSchema: z.object({
        urls: z.array(httpUrl).min(1).max(20),
        objective: z.string().trim().min(1).max(200).optional(),
      }),
      outputSchema: parallelOutput,
    }),
  },
};
