import type { z, ZodObject, ZodRawShape } from "zod";
import { createClientTool, createServerTool } from "./create-tool";
import type {
  ClientTool,
  ClientToolConfig,
  ClientToolkit,
  ClientToolkitConifg,
  ServerTool,
  ServerToolConfig,
  ServerToolkit,
  ToolkitConfig,
} from "./types";

export const createClientToolkit = <
  ToolNames extends string,
  Parameters extends ZodRawShape = ZodRawShape,
>(
  toolkitConfig: ToolkitConfig<ToolNames, Parameters>,
  clientToolkitConfig: ClientToolkitConifg<Parameters>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolConfigs: Record<ToolNames, ClientToolConfig<any, any>>,
): ClientToolkit<ToolNames, Parameters> => {
  return {
    ...toolkitConfig,
    ...clientToolkitConfig,
    tools: Object.keys(toolConfigs).reduce(
      (acc, toolName) => {
        const typedToolName = toolName as ToolNames;
        const baseToolConfig = toolkitConfig.tools[typedToolName];
        const toolConfig = toolConfigs[typedToolName];
        acc[typedToolName] = createClientTool(baseToolConfig, toolConfig);
        return acc;
      },
      {} as Record<ToolNames, ClientTool>,
    ),
  } as ClientToolkit<ToolNames, Parameters>;
};

export const createServerToolkit = <
  ToolNames extends string,
  Parameters extends ZodRawShape = ZodRawShape,
>(
  toolkitConfig: ToolkitConfig<ToolNames, Parameters>,
  systemPrompt: string,
  toolConfigs: (
    params: z.infer<ZodObject<Parameters>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<Record<ToolNames, ServerToolConfig<any, any>>>,
): ServerToolkit<ToolNames, Parameters> => {
  return {
    systemPrompt,
    tools: async (params: z.infer<ZodObject<Parameters>>) => {
      const tools = await toolConfigs(params);

      return Object.keys(tools).reduce(
        (acc, toolName) => {
          const typedToolName = toolName as ToolNames;
          const baseToolConfig = toolkitConfig.tools[typedToolName];
          const toolConfig = tools[typedToolName];
          acc[typedToolName] = createServerTool(baseToolConfig, toolConfig);
          return acc;
        },
        {} as Record<ToolNames, ServerTool>,
      );
    },
  };
};
