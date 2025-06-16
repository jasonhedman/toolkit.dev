import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

// Define the toolkit config schema
const toolkitConfigSchema = z.object({
  id: z.string(),
  parameters: z.record(z.any()).default({}),
});

export const workbenchesRouter = createTRPCRouter({
  getWorkbenches: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit, cursor } = input;

      const items = await ctx.db.workbench.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          _count: {
            select: {
              chats: true,
            },
          },
        },
      });

      const nextCursor =
        items.length > limit ? items[items.length - 1]?.id : undefined;
      const workbenches = items.slice(0, limit);

      return {
        items: workbenches,
        hasMore: items.length > limit,
        nextCursor,
      };
    }),

  getWorkbench: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const workbench = await ctx.db.workbench.findUnique({
        where: {
          id: input,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          chats: {
            where: {
              userId, // Only show chats from the current user
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
          _count: {
            select: {
              chats: true,
            },
          },
        },
      });

      if (!workbench) {
        return null;
      }

      // Allow access if: user owns the workbench OR workbench is public
      const hasAccess = workbench.userId === userId || workbench.visibility === "public";
      
      if (!hasAccess) {
        return null;
      }

      return workbench;
    }),

  createWorkbench: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        systemPrompt: z.string().max(10000),
        toolkitConfigs: z.array(toolkitConfigSchema).default([]),
        visibility: z.enum(["public", "private"]).default("private"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.workbench.create({
        data: {
          name: input.name,
          systemPrompt: input.systemPrompt,
          toolkitConfigs: input.toolkitConfigs,
          visibility: input.visibility,
          userId,
        },
      });
    }),

  updateWorkbench: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100),
        systemPrompt: z.string().max(10000),
        toolkitConfigs: z.array(toolkitConfigSchema).default([]),
        visibility: z.enum(["public", "private"]).default("private"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.workbench.update({
        where: {
          id: input.id,
          userId,
        },
        data: {
          name: input.name,
          systemPrompt: input.systemPrompt,
          toolkitConfigs: input.toolkitConfigs,
          visibility: input.visibility,
        },
      });
    }),

  deleteWorkbench: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.workbench.delete({
        where: {
          id: input,
          userId,
        },
      });
    }),

  createChatWithWorkbench: protectedProcedure
    .input(
      z.object({
        workbenchId: z.string(),
        title: z.string().min(1).max(100),
        visibility: z.enum(["public", "private"]).default("private"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify workbench ownership
      const workbench = await ctx.db.workbench.findUnique({
        where: {
          id: input.workbenchId,
          userId,
        },
      });

      if (!workbench) {
        throw new Error("Workbench not found or access denied");
      }

      return ctx.db.chat.create({
        data: {
          title: input.title,
          userId,
          visibility: input.visibility,
          workbenchId: input.workbenchId,
        },
      });
    }),

  getWorkbenchChats: protectedProcedure
    .input(
      z.object({
        workbenchId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { workbenchId, limit, cursor } = input;

      // Verify workbench ownership
      const workbench = await ctx.db.workbench.findUnique({
        where: {
          id: workbenchId,
          userId,
        },
      });

      if (!workbench) {
        throw new Error("Workbench not found or access denied");
      }

      const items = await ctx.db.chat.findMany({
        where: {
          workbenchId,
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      const nextCursor =
        items.length > limit ? items[items.length - 1]?.id : undefined;
      const chats = items.slice(0, limit);

      return {
        items: chats,
        hasMore: items.length > limit,
        nextCursor,
      };
    }),

  duplicateWorkbench: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const originalWorkbench = await ctx.db.workbench.findUnique({
        where: {
          id: input,
          userId,
        },
      });

      if (!originalWorkbench) {
        throw new Error("Workbench not found or access denied");
      }

      return ctx.db.workbench.create({
        data: {
          name: `${originalWorkbench.name} (Copy)`,
          systemPrompt: originalWorkbench.systemPrompt,
          toolkitConfigs: originalWorkbench.toolkitConfigs,
          visibility: originalWorkbench.visibility,
          userId,
        },
      });
    }),

  forkWorkbench: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const originalWorkbench = await ctx.db.workbench.findUnique({
        where: {
          id: input,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!originalWorkbench) {
        throw new Error("Workbench not found");
      }

      // Check if user can fork this workbench
      // Allow forking if: workbench is public OR user owns the workbench
      const canFork = originalWorkbench.visibility === "public" || originalWorkbench.userId === userId;
      
      if (!canFork) {
        throw new Error("You can only fork public workbenches or your own workbenches");
      }

      // Don't allow forking your own workbench (use duplicate instead)
      if (originalWorkbench.userId === userId) {
        throw new Error("Use duplicate instead of fork for your own workbenches");
      }

      return ctx.db.workbench.create({
        data: {
          name: `${originalWorkbench.name} (Forked from ${originalWorkbench.user.name})`,
          systemPrompt: originalWorkbench.systemPrompt,
          toolkitConfigs: originalWorkbench.toolkitConfigs,
          visibility: "private", // Forked workbenches are private by default
          userId,
        },
      });
    }),

  getPublicWorkbenches: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search } = input;

      const items = await ctx.db.workbench.findMany({
        where: {
          visibility: "public",
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { systemPrompt: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              chats: true,
            },
          },
        },
        orderBy: [
          { createdAt: "desc" },
        ],
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      const nextCursor =
        items.length > limit ? items[items.length - 1]?.id : undefined;
      const workbenches = items.slice(0, limit);

      return {
        items: workbenches,
        hasMore: items.length > limit,
        nextCursor,
      };
    }),
});
