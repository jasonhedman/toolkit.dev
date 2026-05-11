import type { BaseTool, ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";

const headersSchema = z
  .string()
  .optional()
  .refine(
    (headers) => {
      const trimmedHeaders = headers?.trim();
      if (!trimmedHeaders) return true;

      try {
        const parsed: unknown = JSON.parse(trimmedHeaders);

        return (
          !!parsed &&
          !Array.isArray(parsed) &&
          typeof parsed === "object" &&
          Object.values(parsed).every((value) => typeof value === "string")
        );
      } catch {
        return false;
      }
    },
    {
      message: "Headers must be a JSON object with string values.",
    },
  );

export const mcpParameters = z.object({
  serverUrl: z
    .string()
    .trim()
    .url()
    .refine((value) => new URL(value).protocol === "https:", {
      message: "MCP server URL must use HTTPS.",
    }),
  headers: headersSchema,
});

export const baseMcpToolkitConfig: ToolkitConfig<
  string,
  typeof mcpParameters.shape
> = {
  tools: {} as Record<string, BaseTool>,
  parameters: mcpParameters,
};
