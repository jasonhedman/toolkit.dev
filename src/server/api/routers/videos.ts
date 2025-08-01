import { z } from "zod";
import { createTRPCRouter, protectedProcedure} from "@/server/api/trpc";

export const videosRouter = createTRPCRouter({
  getUserVideos: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const items = await ctx.db.video.findMany({
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
  getVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.video.findFirst({
        where: {
          id: input.videoId,
          userId, // Ensure user can only access their own videos
        },
      });
    }),
  getVideoCountByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.video.count({
      where: {
        userId,
      },
    });
  }),
  createVideo: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        modelId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.video.create({
        data: {
          userId: userId,
          url: input.url,
          modelId: input.modelId,
        },
      });
    }),

  deleteVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Ensure the user can only delete their own videos
      const video = await ctx.db.video.findFirst({
        where: {
          id: input.videoId,
          userId,
        },
      });

      if (!video) {
        throw new Error("Video not found or you do not have permission to delete it.");
      }

      return ctx.db.video.delete({
        where: {
          id: input.videoId,
        },
      });
    }),
  deleteAllUserVideos: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      return ctx.db.video.deleteMany({
        where: {
          userId,
        },
      });
    }),
});

