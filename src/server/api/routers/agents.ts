import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { runAgentTask } from "@/trigger/agent";

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
  runId: z.string().optional(),
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

  // List agent runs with filtering and pagination
  listRuns: protectedProcedure
    .input(listRunsSchema)
    .query(async ({ ctx, input }) => {
      // If runId is provided, we're looking for a specific run
      if (input.runId) {
        const runsResponse = await runs.list({
          limit: 100, // Get more to find the specific run
        });

        const foundRun = runsResponse.data.find(run => run.id === input.runId);
        if (!foundRun) {
          return {
            success: true,
            runs: [],
            pagination: {
              hasMore: false,
              nextCursor: null,
            },
          };
        }

        // Transform the single run
        const transformedRun = {
          id: foundRun.id,
          taskId: foundRun.id,
          status: foundRun.status,
          model: (foundRun as any).metadata?.selectedChatModel || "unknown",
          prompt: (foundRun as any).metadata?.prompt || "No prompt available",
          toolkits: (foundRun as any).metadata?.toolkits || [],
          createdAt: foundRun.createdAt.toISOString(),
          completedAt: foundRun.finishedAt?.toISOString(),
          output: (foundRun as any).output ? JSON.stringify((foundRun as any).output) : undefined,
          error: (foundRun as any).error ? JSON.stringify((foundRun as any).error) : undefined,
          durationMs: foundRun.finishedAt && foundRun.createdAt 
            ? foundRun.finishedAt.getTime() - foundRun.createdAt.getTime() 
            : undefined,
          costInCents: (foundRun as any).costInCents,
          metadata: (foundRun as any).metadata,
        };

        return {
          success: true,
          runs: [transformedRun],
          pagination: {
            hasMore: false,
            nextCursor: null,
          },
        };
      }

      // Fetch runs from Trigger.dev
      const runsResponse = await runs.list({
        limit: input.limit,
        status: input.status ? [input.status as any] : undefined,
      });

      // Transform the data to match our AgentRun interface
      const transformedRuns = runsResponse.data.map((run) => ({
        id: run.id,
        taskId: run.id,
        status: run.status,
        model: (run as any).metadata?.selectedChatModel || "unknown",
        prompt: (run as any).metadata?.prompt || "No prompt available",
        toolkits: (run as any).metadata?.toolkits || [],
        createdAt: run.createdAt.toISOString(),
        completedAt: run.finishedAt?.toISOString(),
        output: (run as any).output ? JSON.stringify((run as any).output) : undefined,
        error: (run as any).error ? JSON.stringify((run as any).error) : undefined,
        durationMs: run.finishedAt && run.createdAt 
          ? run.finishedAt.getTime() - run.createdAt.getTime() 
          : undefined,
        costInCents: (run as any).costInCents,
        metadata: (run as any).metadata,
      }));

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