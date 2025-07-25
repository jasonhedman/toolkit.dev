import { openai } from "@ai-sdk/openai";
import { getServerToolkit } from "@/toolkits/toolkits/server";
import { createServerOnlyCaller } from "@/server/api/root";
import { Toolkits } from "@/toolkits/toolkits/shared";
import { createCoreAgentConfig, type SimpleToolkit, type CoreAgentConfig } from "@/ai/agent-core";

export interface AgentConfigInput {
  toolkits: Array<{ id: Toolkits; parameters: Record<string, any> }>;
  selectedChatModel: string;
  useNativeSearch?: boolean;
  systemPrompt?: string;
  baseSystemPrompt?: string;
}

export interface AgentConfig extends CoreAgentConfig {}

export async function createAgentConfig({
  toolkits,
  selectedChatModel,
  useNativeSearch = false,
  systemPrompt,
  baseSystemPrompt,
}: AgentConfigInput): Promise<AgentConfig> {
  // Convert server toolkits to simple toolkits
  const simpleToolkits: SimpleToolkit[] = await Promise.all(
    toolkits.map(async ({ id, parameters }) => {
      const toolkit = getServerToolkit(id);
      const serverTools = await toolkit.tools(parameters);
      
      const tools = Object.keys(serverTools).map((toolName) => {
        const serverTool = serverTools[toolName as keyof typeof serverTools];
        return {
          name: toolName,
          description: serverTool.description,
          inputSchema: serverTool.inputSchema,
          execute: async (args: any) => {
            try {
              const result = await serverTool.callback(args);

              // Increment tool usage on successful execution
              try {
                const serverCaller = await createServerOnlyCaller();
                await serverCaller.tools.incrementToolUsageServer({
                  toolkit: id,
                  tool: toolName,
                });
              } catch (error) {
                console.error("Failed to increment tool usage:", error);
              }

              if (serverTool.message) {
                return {
                  result,
                  message:
                    typeof serverTool.message === "function"
                      ? serverTool.message(result)
                      : serverTool.message,
                };
              } else {
                return {
                  result,
                };
              }
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
        };
      });

      return {
        id,
        systemPrompt: toolkit.systemPrompt,
        tools,
      };
    })
  );

  // Use core agent config
  const coreConfig = createCoreAgentConfig({
    toolkits: simpleToolkits,
    selectedChatModel,
    useNativeSearch,
    systemPrompt,
    baseSystemPrompt,
  });

  // Add OpenAI native search if enabled
  const isOpenAi = selectedChatModel.startsWith("openai");
  if (isOpenAi && useNativeSearch) {
    coreConfig.tools.web_search_preview = openai.tools.webSearchPreview();
  }

  return coreConfig;
}