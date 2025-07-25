import { tool, type Tool } from "ai";
import { generateUUID } from "@/lib/utils";

// Lightweight agent configuration without server dependencies
export interface CoreAgentConfig {
  tools: Record<string, Tool>;
  systemPrompt: string;
  selectedChatModel: string;
  useNativeSearch: boolean;
  maxSteps: number;
  toolCallStreaming: boolean;
  experimental_generateMessageId: () => string;
}

// Default opinionated system prompt
const DEFAULT_BASE_SYSTEM_PROMPT = `You are a helpful assistant. The current date and time is ${new Date().toLocaleString()}. Whenever you are asked to write code, you must include a language with \`\`\``;

// Default AI SDK configuration
const DEFAULT_AGENT_CONFIG = {
  maxSteps: 15,
  toolCallStreaming: true,
  experimental_generateMessageId: generateUUID,
} as const;

export interface SimpleTool {
  name: string;
  description: string;
  inputSchema: any;
  execute: (args: any) => Promise<any>;
}

export interface SimpleToolkit {
  id: string;
  systemPrompt: string;
  tools: SimpleTool[];
}

export function createCoreAgentConfig({
  toolkits,
  selectedChatModel,
  useNativeSearch = false,
  systemPrompt,
  baseSystemPrompt = DEFAULT_BASE_SYSTEM_PROMPT,
}: {
  toolkits: SimpleToolkit[];
  selectedChatModel: string;
  useNativeSearch?: boolean;
  systemPrompt?: string;
  baseSystemPrompt?: string;
}): CoreAgentConfig {
  // Transform simple toolkits into AI SDK tools
  const tools: Record<string, Tool> = {};
  
  for (const toolkit of toolkits) {
    for (const simpleTool of toolkit.tools) {
      const toolName = `${toolkit.id}_${simpleTool.name}`;
      tools[toolName] = tool({
        description: simpleTool.description,
        parameters: simpleTool.inputSchema,
        execute: simpleTool.execute,
      });
    }
  }

  // Collect toolkit system prompts
  const toolkitSystemPrompts = toolkits.map(toolkit => toolkit.systemPrompt);

  // Build comprehensive system prompt
  const toolkitInstructions =
    toolkitSystemPrompts.length > 0
      ? `\n\n## Available Toolkits\n\nYou have access to the following toolkits and their capabilities:\n\n${toolkitSystemPrompts.join("\n\n---\n\n")}\n\n${systemPrompt ?? ""}`
      : "";

  const fullSystemPrompt = baseSystemPrompt + toolkitInstructions;

  return {
    tools,
    systemPrompt: fullSystemPrompt,
    selectedChatModel,
    useNativeSearch,
    ...DEFAULT_AGENT_CONFIG,
  };
} 