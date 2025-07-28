import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tasks, runs, type RetrieveRunResult } from "@trigger.dev/sdk/v3";
import type { runAgentTask } from "@/trigger/agent";
import type { AgentRunOutput } from "@/app/_components/agent-dashboard/types";
import { db } from "@/server/db";

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
      // Extract prompt from the last user message
      const userMessage = input.messages.filter(msg => msg.role === "user").pop();
      const prompt = userMessage?.content || "No prompt available";

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

      // Create an AgentJob record in our database for access control
      await db.agentJob.create({
        data: {
          userId: ctx.session.user.id,
          triggerJobId: handle.id,
          prompt: prompt,
          model: input.selectedChatModel || "openai/gpt-4",
          toolkits: input.toolkits?.map(t => t.id) || [],
          systemPrompt: input.systemPrompt,
          status: "QUEUED",
        },
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
      // First, check if the user owns this job
      const agentJob = await db.agentJob.findFirst({
        where: {
          triggerJobId: input.runId,
          userId: ctx.session.user.id,
        },
      });

      if (!agentJob) {
        throw new Error("Job not found or access denied");
      }

      // Fetch the actual run details from Trigger.dev
      const run = await runs.retrieve(input.runId) as RetrieveRunResult<typeof runAgentTask>;
      
      if (!run) {
        throw new Error(`Run with ID ${input.runId} not found in Trigger.dev`);
      }

      // Update our local job record with latest status if needed
      if (agentJob.status !== run.status) {
        await db.agentJob.update({
          where: { id: agentJob.id },
          data: {
            status: run.status,
            completedAt: run.finishedAt,
            durationMs: run.finishedAt && run.createdAt 
              ? run.finishedAt.getTime() - run.createdAt.getTime() 
              : undefined,
            costInCents: (run as any).costInCents,
            error: (run as any).error ? JSON.stringify((run as any).error) : undefined,
          },
        });
      }

      // Get the properly structured output from the task result
      const taskOutput = run.output as AgentRunOutput | undefined;
      
      const transformedRun = {
        id: run.id,
        taskId: run.id,
        status: run.status,
        model: agentJob.model,
        prompt: agentJob.prompt,
        toolkits: agentJob.toolkits,
        createdAt: run.createdAt.toISOString(),
        completedAt: run.finishedAt?.toISOString(),
        output: taskOutput,
        error: (run as any).error ? JSON.stringify((run as any).error) : undefined,
        durationMs: run.finishedAt && run.createdAt 
          ? run.finishedAt.getTime() - run.createdAt.getTime() 
          : undefined,
        costInCents: (run as any).costInCents,
        metadata: (run as any).metadata,
      };

      return {
        success: true,
        run: transformedRun,
      };
    }),

  // List agent runs with filtering and pagination
  listRuns: protectedProcedure
    .input(listRunsSchema)
    .query(async ({ ctx, input }) => {
      // Get user's agent jobs from our database
      const agentJobs = await db.agentJob.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.status && input.status !== "all" ? { status: input.status } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
      });

      // For each job, we'll use the stored data but sync status if needed
      const transformedRuns = await Promise.all(
        agentJobs.map(async (job) => {
          let updatedJob = job;
          
          // If job is still running, check for updates from Trigger.dev
          if (job.status === "QUEUED" || job.status === "EXECUTING") {
            try {
              const run = await runs.retrieve(job.triggerJobId);
              if (run && run.status !== job.status) {
                // Update the job status in our database
                updatedJob = await db.agentJob.update({
                  where: { id: job.id },
                  data: {
                    status: run.status,
                    completedAt: run.finishedAt,
                    durationMs: run.finishedAt && run.createdAt 
                      ? run.finishedAt.getTime() - run.createdAt.getTime() 
                      : undefined,
                    costInCents: (run as any).costInCents,
                    error: (run as any).error ? JSON.stringify((run as any).error) : undefined,
                  },
                });
              }
            } catch (error) {
              console.error(`Failed to sync status for job ${job.id}:`, error);
              // Continue with stored data if sync fails
            }
          }

          return {
            id: updatedJob.triggerJobId,
            taskId: updatedJob.triggerJobId,
            status: updatedJob.status,
            model: updatedJob.model,
            prompt: updatedJob.prompt,
            toolkits: updatedJob.toolkits,
            createdAt: updatedJob.createdAt.toISOString(),
            completedAt: updatedJob.completedAt?.toISOString(),
            output: undefined, // We don't store output in our DB, would need to fetch from Trigger.dev if needed
            error: updatedJob.error,
            durationMs: updatedJob.durationMs,
            costInCents: updatedJob.costInCents,
            metadata: undefined,
          };
        })
      );

      return {
        success: true,
        runs: transformedRuns,
        pagination: {
          hasMore: agentJobs.length === input.limit, // Simple pagination
          nextCursor: null,
        },
      };
    }),

  // Cancel a specific agent run
  cancelRun: protectedProcedure
    .input(z.object({
      runId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // First, check if the user owns this job
      const agentJob = await db.agentJob.findFirst({
        where: {
          triggerJobId: input.runId,
          userId: ctx.session.user.id,
        },
      });

      if (!agentJob) {
        throw new Error("Job not found or access denied");
      }

      // Cancel the run using Trigger.dev API
      await runs.cancel(input.runId);

      // Update our local job record
      await db.agentJob.update({
        where: { id: agentJob.id },
        data: {
          status: "CANCELED",
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Run cancelled successfully",
      };
    }),
}); 