import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tasks, runs, type RetrieveRunResult } from "@trigger.dev/sdk/v3";
import type { runAgentTask } from "@/trigger/agent";
import type { AgentRunOutput } from "@/app/_components/agent-dashboard/types";

const triggerAgentSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
  toolkits: z.array(z.object({
    id: z.string(),
    parameters: z.record(z.any()),
  })).optional(),
  selectedChatModel: z.string().optional(),
  systemPrompt: z.string().optional(),
  useNativeSearch: z.boolean().optional(),
});

const listRunsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  status: z.string().optional(),
});

const getRunSchema = z.object({
  runId: z.string(),
});

export const agentsRouter = createTRPCRouter({
  // Run an agent with given configuration
  run: protectedProcedure
    .input(triggerAgentSchema)
    .mutation(async ({ ctx, input }) => {
      // Trigger the agent task
      const handle = await tasks.trigger<typeof runAgentTask>("run-agent", {
        messages: input.messages,
        toolkits: input.toolkits?.map(t => ({ 
          id: t.id as any, 
          parameters: t.parameters 
        })) || [],
        selectedChatModel: input.selectedChatModel || "openai/gpt-4",
        systemPrompt: input.systemPrompt,
        useNativeSearch: input.useNativeSearch || false,
      });

      return {
        success: true,
        taskId: handle.id,
        handle: handle,
      };
    }),

  // Get a specific agent run by ID
  getRun: protectedProcedure
    .input(getRunSchema)
    .query(async ({ ctx, input }) => {
      const run = await runs.retrieve(input.runId) as RetrieveRunResult<typeof runAgentTask>;
      console.log("Run:", run);

      if (!run) {
        throw new Error(`Run with ID ${input.runId} not found`);
      }

      // Transform the single run with proper output structure
      let extractedPrompt = "No prompt available";
      let extractedModel = "unknown";
      let extractedToolkits: string[] = [];
      
      try {
        // Get prompt and model from payload (input data)
        const payload = run.payload;
        if (payload?.messages && Array.isArray(payload.messages) && payload.messages.length > 0) {
          // Get the last user message as the prompt
          const userMessage = payload.messages.filter((msg: any) => msg.role === "user").pop();
          if (userMessage?.content) {
            extractedPrompt = userMessage.content;
          }
        }
        
        if (payload?.selectedChatModel) {
          extractedModel = payload.selectedChatModel;
        }
        
        if (payload?.toolkits && Array.isArray(payload.toolkits)) {
          extractedToolkits = payload.toolkits.map((t: any) => t.id || t.name || 'Unknown');
        }
      } catch (error) {
        console.error("Error extracting single run data:", error);
        // Fallback values
        extractedPrompt = "No prompt available";
        extractedModel = "unknown";
        extractedToolkits = [];
      }

      // Get the properly structured output from the task result
      const taskOutput = run.output as AgentRunOutput | undefined;
      
      const transformedRun = {
        id: run.id,
        taskId: run.id,
        status: run.status,
        model: extractedModel,
        prompt: extractedPrompt,
        toolkits: extractedToolkits,
        createdAt: run.createdAt.toISOString(),
        completedAt: run.finishedAt?.toISOString(),
        output: taskOutput, // This should be the full AgentRunOutput structure
        error: (run as any).error ? JSON.stringify((run as any).error) : undefined,
        durationMs: run.finishedAt && run.createdAt 
          ? run.finishedAt.getTime() - run.createdAt.getTime() 
          : undefined,
        costInCents: (run as any).costInCents,
        metadata: (run as any).metadata,
      };

      console.log("Transformed run with output:", {
        id: transformedRun.id,
        status: transformedRun.status,
        hasOutput: !!transformedRun.output,
        outputStructure: transformedRun.output ? Object.keys(transformedRun.output) : [],
        outputSuccess: transformedRun.output?.success,
        hasData: !!transformedRun.output?.data,
        hasError: !!transformedRun.output?.error,
      });

      return {
        success: true,
        run: transformedRun,
      };
    }),

  // List agent runs with filtering and pagination
  listRuns: protectedProcedure
    .input(listRunsSchema)
    .query(async ({ ctx, input }) => {
      // Fetch runs from Trigger.dev
      const runsResponse = await runs.list({
        limit: input.limit,
        status: input.status ? [input.status as any] : undefined,
      });

      console.log("Runs response:", runsResponse);

      // Transform the data to match our AgentRun interface
      const transformedRuns = runsResponse.data.map((run) => {
        // Debug: Log the structure we're getting from Trigger.dev
        console.log("Run structure:", {
          id: run.id,
          status: run.status,
          hasPayload: !!(run as any).payload,
          hasOutput: !!(run as any).output,
          payloadKeys: (run as any).payload ? Object.keys((run as any).payload) : [],
          outputType: typeof (run as any).output,
          outputStructure: (run as any).output ? Object.keys((run as any).output) : [],
        });
        
        // Extract the prompt from the payload's messages if available
        let extractedPrompt = "No prompt available";
        let extractedModel = "unknown";
        let extractedToolkits: string[] = [];
        
        try {
          // Get prompt and model from payload (input data)
          const payload = (run as any).payload;
          if (payload?.messages && Array.isArray(payload.messages) && payload.messages.length > 0) {
            // Get the last user message as the prompt
            const userMessage = payload.messages.filter((msg: any) => msg.role === "user").pop();
            if (userMessage?.content) {
              extractedPrompt = userMessage.content;
            }
          }
          
          if (payload?.selectedChatModel) {
            extractedModel = payload.selectedChatModel;
          }
          
          if (payload?.toolkits && Array.isArray(payload.toolkits)) {
            extractedToolkits = payload.toolkits.map((t: any) => t.id || t.name || 'Unknown');
          }
        } catch (error) {
          console.error("Error extracting run data:", error);
          // Fallback values
          extractedPrompt = "No prompt available";
          extractedModel = "unknown";
          extractedToolkits = [];
        }

        // Get the properly structured output from the task result
        const taskOutput = (run as any).output as AgentRunOutput | undefined;

        return {
          id: run.id,
          taskId: run.id,
          status: run.status,
          model: extractedModel,
          prompt: extractedPrompt,
          toolkits: extractedToolkits,
          createdAt: run.createdAt.toISOString(),
          completedAt: run.finishedAt?.toISOString(),
          output: taskOutput, // This should be the full AgentRunOutput structure
          error: (run as any).error ? JSON.stringify((run as any).error) : undefined,
          durationMs: run.finishedAt && run.createdAt 
            ? run.finishedAt.getTime() - run.createdAt.getTime() 
            : undefined,
          costInCents: (run as any).costInCents,
          metadata: (run as any).metadata,
        };
      });

      return {
        success: true,
        runs: transformedRuns,
        pagination: {
          hasMore: (runsResponse as any).hasMore || false,
          nextCursor: (runsResponse as any).nextCursor || null,
        },
      };
    }),

  // Cancel a specific agent run
  cancelRun: protectedProcedure
    .input(z.object({
      runId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Cancel the run using Trigger.dev API
      await runs.cancel(input.runId);

      return {
        success: true,
        message: "Run cancelled successfully",
      };
    }),
}); 