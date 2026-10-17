import { tool, type Tool } from "ai";
import { getServerToolkit } from "./toolkits/server";
import type { Toolkits } from "./toolkits/shared";
import type { ToolExecutionContext } from "./types";

export async function resolveToolkitTools(
  selected: Array<{ id: Toolkits; parameters: Record<string, unknown> }>,
  context: ToolExecutionContext,
  onSuccess?: (toolkit: Toolkits, name: string) => Promise<void>,
) {
  const loaded = await Promise.all(
    selected.map(async ({ id, parameters }) => {
      const toolkit = getServerToolkit(id);
      const serverTools = await toolkit.tools(parameters);
      const tools: Record<string, Tool> = {};
      for (const [name, serverTool] of Object.entries(serverTools)) {
        tools[`${id}_${name}`] = tool({
          description: serverTool.description,
          parameters: serverTool.inputSchema,
          execute: async (args, { abortSignal }) => {
            try {
              const result = await serverTool.callback(args, {
                ...context,
                ...(abortSignal ? { abortSignal } : {}),
              });
              try {
                await onSuccess?.(id, name);
              } catch (error) {
                console.error("Failed to increment tool usage:", error);
              }
              return {
                result,
                ...(serverTool.message
                  ? {
                      message:
                        typeof serverTool.message === "function"
                          ? serverTool.message(result)
                          : serverTool.message,
                    }
                  : {}),
              };
            } catch (error) {
              console.error(error);
              return {
                isError: true,
                result: {
                  error:
                    error instanceof Error
                      ? error.message
                      : "An error occurred while executing the tool",
                },
              };
            }
          },
        });
      }
      return { tools, systemPrompt: toolkit.systemPrompt };
    }),
  );
  return {
    tools: Object.assign(
      {} as Record<string, Tool>,
      ...loaded.map((toolkit) => toolkit.tools),
    ),
    systemPrompts: loaded.map((toolkit) => toolkit.systemPrompt),
  };
}
