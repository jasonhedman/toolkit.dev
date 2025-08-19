import type { DeepPartial } from "ai";
import type { z, ZodObject, ZodRawShape } from "zod";

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

export type ClientToolkitWrapper = React.FC<{
  Item: React.FC<{ isLoading: boolean; onSelect?: () => void }>;
}>;

export type EnvVar = {
  key: string;
  description: React.ReactNode;
};

export type EnvVarGroupAll = {
  type: "all";
  keys: string[];
  description: React.ReactNode;
};

export type EnvVarGroupAny = {
  type: "any";
  keys: EnvVar[];
};

export type EnvVars = Array<EnvVarGroupAll | EnvVarGroupAny>;

export type ClientToolkitConifg<Parameters extends ZodRawShape = ZodRawShape> =
  {
    name: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    envVars: EnvVars;
    form: React.ComponentType<{
      parameters: z.infer<ZodObject<Parameters>>;
      setParameters: (parameters: z.infer<ZodObject<Parameters>>) => void;
    }> | null;
    type: ToolkitGroups;
    Wrapper?: React.FC<{
      Item: React.FC<{ isLoading: boolean; onSelect?: () => void }>;
    }>;
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

// ------------------------------------------------------------
// Tool Types
// ------------------------------------------------------------

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
  append: (message: { text?: string; files?: Array<{ url: string; filename?: string; mediaType: string }> }) => void;
  }>;
};

export type ClientTool<
  Args extends ZodRawShape = ZodRawShape,
  Result extends ZodRawShape = ZodRawShape,
> = ClientToolConfig<Args, Result> & BaseTool<Args, Result>;

// ------------------------------------------------------------
// UI Types
// ------------------------------------------------------------

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
