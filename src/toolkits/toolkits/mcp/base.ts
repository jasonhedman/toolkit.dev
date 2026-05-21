import { z } from "zod";

import type { ToolkitConfig } from "@/toolkits/types";

import type { McpTools } from "./tools";

const isHeadersJson = (value: string | undefined) => {
  if (!value?.trim()) {
    return true;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    return (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      Object.values(parsed).every(
        (headerValue) => typeof headerValue === "string",
      )
    );
  } catch {
    return false;
  }
};

export const mcpParameters = z.object({
  url: z.string().url(),
  headers: z
    .string()
    .optional()
    .refine(isHeadersJson, "Headers must be a JSON object with string values"),
});

export const parseMcpHeaders = (
  headers: string | undefined,
): Record<string, string> | undefined => {
  if (!headers?.trim()) {
    return undefined;
  }

  return JSON.parse(headers) as Record<string, string>;
};

export const baseMcpToolkitConfig: ToolkitConfig<
  McpTools,
  typeof mcpParameters.shape
> = {
  tools: {},
  parameters: mcpParameters,
};
