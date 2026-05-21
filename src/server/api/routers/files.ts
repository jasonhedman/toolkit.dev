import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { FILE_NAME_MAX_LENGTH } from "@/lib/constants";

export const filesRouter = createTRPCRouter({
  getUserFiles: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const items = await ctx.db.file.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const hasMore = items.length > input.limit;
      const nextCursor = hasMore ? items[input.limit]!.id : undefined;

      return {
        items: items.slice(0, input.limit),
        nextCursor,
      };
    }),

  getFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.file.findFirst({
        where: {
          id: input.fileId,
          userId, // Ensure user can only access their own files
        },
      });
    }),

  getFileCountByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.file.count({
      where: {
        userId,
      },
    });
  }),

  createFile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(FILE_NAME_MAX_LENGTH),
        contentType: z.string(),
        url: z.string().url(),
        embeddingStatus: z
          .enum(["skipped", "indexing", "indexed", "failed"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.file.create({
        data: {
          name: input.name,
          contentType: input.contentType,
          url: input.url,
          embeddingStatus: input.embeddingStatus ?? "skipped",
          userId,
        },
      });
    }),

  updateFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        name: z.string().min(1).max(FILE_NAME_MAX_LENGTH).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.file.update({
        where: {
          id: input.fileId,
          userId, // Ensure user can only update their own files
        },
        data: {
          ...(input.name && { name: input.name }),
        },
      });
    }),

  deleteFile: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.file.delete({
        where: {
          id: input,
          userId, // Ensure user can only delete their own files
        },
      });
    }),

  deleteAllUserFiles: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.file.deleteMany({
      where: {
        userId,
      },
    });
  }),
});
