import type { CreateMessage, DeepPartial } from "ai";
import type { z, ZodObject, ZodRawShape } from "zod";

export type BaseTool<
  Args extends ZodRawShape = ZodRawShape,
  Result extends ZodRawShape = ZodRawShape,
> = {
  description: string;
  inputSchema: ZodObject<Args>;
  outputSchema: ZodObject<Result>;
};

export type ServerToolConfig<
  Args extends ZodRawShape = ZodRawShape,
  Result extends ZodRawShape = ZodRawShape,
> = {
  callback: (
    args: z.infer<ZodObject<Args>>,
  ) => Promise<z.infer<ZodObject<Result>>>;
  message?: string | ((result: z.infer<ZodObject<Result>>) => string);
};

export type ServerTool<
  Args extends ZodRawShape = ZodRawShape,
  Result extends ZodRawShape = ZodRawShape,
> = ServerToolConfig<Args, Result> & BaseTool<Args, Result>;

export type ClientToolConfig<
  Args extends ZodRawShape = ZodRawShape,
  Result extends ZodRawShape = ZodRawShape,
> = {
  CallComponent: React.ComponentType<{
    args: DeepPartial<z.infer<ZodObject<Args>>>;
    isPartial: boolean;
  }>;
  ResultComponent: React.ComponentType<{
    args: z.infer<ZodObject<Args>>;
    result: z.infer<ZodObject<Result>>;
    append: (message: CreateMessage) => void;
  }>;
};

export type ClientTool<
  Args extends ZodRawShape = ZodRawShape,
  Result extends ZodRawShape = ZodRawShape,
> = ClientToolConfig<Args, Result> & BaseTool<Args, Result>;

// ------------------------------------------------------------
// Toolkits
// ------------------------------------------------------------

export type ToolkitConfig<
  ToolNames extends string,
  Parameters extends ZodRawShape = ZodRawShape,
  Tool extends BaseTool = BaseTool,
> = {
  tools: Record<ToolNames, Tool>;
  parameters: z.ZodObject<Parameters>;
};

export type ClientToolkitConifg<Parameters extends ZodRawShape = ZodRawShape> =
  {
    name: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    form: React.ComponentType<{
      parameters: z.infer<ZodObject<Parameters>>;
      setParameters: (parameters: z.infer<ZodObject<Parameters>>) => void;
    }> | null;
    addToolkitWrapper?: React.ComponentType<{
      children: React.ReactNode;
    }>;
    type: ToolkitGroups;
  };

export type ClientToolkit<
  ToolNames extends string = string,
  Parameters extends ZodRawShape = ZodRawShape,
> = ToolkitConfig<ToolNames, Parameters, ClientTool> &
  ClientToolkitConifg<Parameters>;

export type ServerToolkit<
  ToolNames extends string = string,
  Parameters extends ZodRawShape = ZodRawShape,
> = {
  systemPrompt: string;
  tools: (
    params: z.infer<ZodObject<Parameters>>,
  ) => Promise<Record<ToolNames, ServerTool>>;
};

export type McpServerConfigBase<
  ToolNames extends string,
  Tool extends BaseTool = BaseTool,
> = {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  tools: Record<ToolNames, Tool>;
};

export type McpServerConfigServer<ToolNames extends string> =
  McpServerConfigBase<`mcp_${string}_${ToolNames}`, ServerTool>;

export type McpServerConfigClient<ToolNames extends string = string> =
  McpServerConfigBase<ToolNames, ClientTool>;

export type SelectedToolkit = {
  id: string;
  toolkit: ClientToolkit;
  parameters: z.infer<ClientToolkit["parameters"]>;
};

export type ToolkitGroup = {
  id: ToolkitGroups;
  name: string;
  icon: React.FC<{ className?: string }>;
};

export enum ToolkitGroups {
  Native = "native",
  KnowledgeBase = "knowledge-base",
  DataSource = "data-source",
}
