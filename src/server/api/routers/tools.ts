import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
  serverOnlyProcedure,
} from "@/server/api/trpc";

const toolIdSchema = z.object({
  id: z.string(),
  toolkitId: z.string(),
});

export const toolsRouter = createTRPCRouter({
  // Get all tools
  getAllTools: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tool.findMany({
      include: {
        toolkit: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        usageCount: "desc",
      },
    });
  }),

  // Get tool by ID
  getToolById: publicProcedure
    .input(toolIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.tool.findUnique({
        where: { id_toolkitId: input },
        include: {
          toolkit: {
            select: {
              id: true,
            },
          },
        },
      });
    }),

  // Get tools by toolkit ID
  getToolsByToolkitId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.tool.findMany({
        where: { toolkitId: input },
        orderBy: {
          usageCount: "desc",
        },
      });
    }),

  // Create tool
  createTool: adminProcedure
    .input(
      z.object({
        id: z.string(),
        toolkitId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tool.create({
        data: {
          id: input.id,
          toolkitId: input.toolkitId,
        },
      });
    }),

  // Delete tool
  deleteTool: adminProcedure
    .input(toolIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tool.delete({
        where: { id_toolkitId: { id: input.id, toolkitId: input.toolkitId } },
      });
    }),

  // Increment tool usage (server-only)
  incrementToolUsageServer: serverOnlyProcedure
    .input(z.object({ toolkit: z.string(), tool: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tool.update({
        where: { id_toolkitId: { id: input.tool, toolkitId: input.toolkit } },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }),

  // Get top tools
  getTopTools: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      return ctx.db.tool.findMany({
        include: {
          toolkit: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          usageCount: "desc",
        },
        take: limit,
      });
    }),

  // Get tool usage statistics
  getToolStats: publicProcedure
    .input(toolIdSchema)
    .query(async ({ ctx, input }) => {
      const tool = await ctx.db.tool.findUnique({
        where: { id_toolkitId: input },
        include: {
          toolkit: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!tool) {
        throw new Error("Tool not found");
      }

      return {
        id: tool.id,
        toolkitId: tool.toolkitId,
        usageCount: tool.usageCount,
      };
    }),

  // Get overall tool statistics
  getOverallStats: publicProcedure.query(async ({ ctx }) => {
    const [totalUsage, toolCount, topTools] = await Promise.all([
      ctx.db.tool.aggregate({
        _sum: {
          usageCount: true,
        },
      }),
      ctx.db.tool.count(),
      ctx.db.tool.findMany({
        include: {
          toolkit: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          usageCount: "desc",
        },
        take: 10,
      }),
    ]);

    return {
      totalUsage: totalUsage._sum.usageCount ?? 0,
      toolCount,
      topTools,
    };
  }),

  // Get tools with zero usage
  getZeroUsageTools: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tool.findMany({
      where: {
        usageCount: 0,
      },
      include: {
        toolkit: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }),

  getTopToolkits: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;

      // Aggregate total usageCount per toolkit by grouping tools
      const toolkitsWithUsage = await ctx.db.tool.groupBy({
        by: ["toolkitId"],
        _sum: {
          usageCount: true,
        },
        orderBy: {
          _sum: {
            usageCount: "desc",
          },
        },
        take: limit,
      });

      // Fetch toolkit details for the top toolkits
      const toolkitIds = toolkitsWithUsage.map((t) => t.toolkitId);
      const toolkitDetails = await ctx.db.toolkit.findMany({
        where: { id: { in: toolkitIds } },
        select: { id: true },
      });

      // Merge usage info with toolkit details
      const result = toolkitsWithUsage.map((tu) => {
        const toolkit = toolkitDetails.find((td) => td.id === tu.toolkitId);
        return {
          id: toolkit?.id,
          totalUsage: tu._sum.usageCount ?? 0,
        };
      });

      return result;
    }),
});
