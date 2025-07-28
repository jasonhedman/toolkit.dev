import { logger, task } from "@trigger.dev/sdk/v3";
import { generateText } from "ai";
import { createRuntimeAgentConfig } from "@/ai/agent-config";
import { convertToCoreMessages } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { Toolkits } from "@/toolkits/toolkits/shared";

export interface AgentTaskPayload {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  toolkits?: Array<{ id: Toolkits; parameters: Record<string, any> }>;
  selectedChatModel?: string;
  systemPrompt?: string;
  useNativeSearch?: boolean;
}

export const runAgentTask = task({
  id: "run-agent",
  maxDuration: 300, // 5 minutes max
  run: async (payload: AgentTaskPayload, { ctx }) => {
    logger.log("Starting agent task", { 
      messageCount: payload.messages.length,
      toolkitsCount: payload.toolkits?.length || 0,
      model: payload.selectedChatModel || "openai/gpt-4"
    });

    try {
      // Use runtime agent configuration (without tool usage tracking)
      const agentConfig = await createRuntimeAgentConfig({
        toolkits: payload.toolkits || [],
        selectedChatModel: payload.selectedChatModel || "openai/gpt-4",
        useNativeSearch: payload.useNativeSearch || false,
        systemPrompt: payload.systemPrompt,
      });

      logger.log("Agent config created", {
        toolCount: Object.keys(agentConfig.tools).length,
        systemPromptLength: agentConfig.systemPrompt.length
      });

      // Convert messages to core format
      const coreMessages = convertToCoreMessages(
        payload.messages.map(msg => ({
          id: Math.random().toString(),
          role: msg.role,
          content: msg.content,
        }))
      );

      // Generate response using the same config as the API route
      const result = await generateText({
        model: openrouter(`${agentConfig.selectedChatModel}${agentConfig.useNativeSearch ? ":search" : ""}`),
        system: agentConfig.systemPrompt,
        messages: coreMessages,
        maxSteps: agentConfig.maxSteps,
        tools: agentConfig.tools,
      });

      logger.log("Agent response generated", {
        responseLength: result.text.length,
        finishReason: result.finishReason,
        usage: result.usage
      });

      // Return a more ergonomic structure for frontend consumption
      return {
        success: true,
        data: {
          // Main response content
          response: result.text,
          finishReason: result.finishReason,
          
          // Usage and performance metrics
          usage: {
            promptTokens: result.usage?.promptTokens || 0,
            completionTokens: result.usage?.completionTokens || 0,
            totalTokens: result.usage?.totalTokens || 0,
            steps: result.steps?.length || 0,
          },
          
          // Tool execution results
          toolResults: result.toolResults || [],
          
          // Input context for reference
          input: {
            model: payload.selectedChatModel || "openai/gpt-4",
            prompt: payload.messages?.filter((msg: any) => msg.role === "user")?.pop()?.content || "No prompt",
            toolkits: payload.toolkits?.map((t: any) => t.id) || [],
            systemPrompt: payload.systemPrompt,
            useNativeSearch: payload.useNativeSearch || false,
          },
          
          // Metadata
          metadata: {
            taskId: ctx.task.id,
            timestamp: new Date().toISOString(),
          }
        }
      };

    } catch (error) {
      logger.error("Agent task failed", { error });
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          taskId: ctx.task.id,
        }
      };
    }
  },
});



// Example scheduled task that uses server toolkits
export const scheduledResearchTask = task({
  id: "scheduled-research-agent",
  maxDuration: 300,
  run: async (payload, { ctx }) => {
    logger.log("Running scheduled research task with server toolkits");

         try {
       const result = await runAgentTask.triggerAndWait({
         messages: [
           {
             role: "user",
             content: "Research the latest developments in AI and machine learning this week. Focus on breakthrough papers and industry announcements."
           }
         ],
         toolkits: [
           { id: Toolkits.Exa, parameters: {} },
           { id: Toolkits.Image, parameters: {} }
         ],
         selectedChatModel: "openai/gpt-4",
         systemPrompt: "You are an AI research assistant. Use the available search tools to gather comprehensive information and provide detailed, well-sourced summaries.",
         useNativeSearch: false,
       });

       if (result.ok) {
         logger.log("Research task completed", { output: result.output });
         return result.output;
       } else {
         logger.error("Research task failed", { error: result.error });
         throw new Error(`Research task failed: ${result.error}`);
       }

    } catch (error) {
      logger.error("Research task failed", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Example task showing how to use specific toolkit tools
export const companyResearchTask = task({
  id: "company-research-agent", 
  maxDuration: 300,
  run: async (payload: { companyName: string }, { ctx }) => {
    logger.log("Running company research task", { companyName: payload.companyName });

         try {
       const result = await runAgentTask.triggerAndWait({
         messages: [
           {
             role: "user", 
             content: `Research the company "${payload.companyName}". I need comprehensive information including: company overview, recent news, key products/services, financial performance, and competitive landscape.`
           }
         ],
         toolkits: [{ id: Toolkits.Exa, parameters: {} }],
         selectedChatModel: "openai/gpt-4",
         systemPrompt: "You are a business research assistant. Use the company research and competitor finder tools to gather comprehensive business intelligence. Provide detailed, structured reports with specific data points and sources.",
         useNativeSearch: false,
       });

       if (result.ok) {
         logger.log("Company research completed", { 
           companyName: payload.companyName,
           responseLength: result.output.success && result.output.data ? result.output.data.response?.length || 0 : 0
         });
         return result.output;
       } else {
         logger.error("Company research failed", { companyName: payload.companyName, error: result.error });
         throw new Error(`Company research failed: ${result.error}`);
       }

    } catch (error) {
      logger.error("Company research failed", { companyName: payload.companyName, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
