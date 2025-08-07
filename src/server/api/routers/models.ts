import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const modelsRouter = createTRPCRouter({
  getTopModels: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        timeframe: z.enum(["today", "week", "month", "all"]).default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, timeframe } = input;

      const now = new Date();
      let dateFilter: Date | undefined;

      switch (timeframe) {
        case "today":
          dateFilter = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "week":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = undefined;
      }

      const messages = await ctx.db.message.groupBy({
        by: ["modelId"],
        _count: {
          modelId: true,
        },
        where: {
          role: "assistant",
          ...(dateFilter && {
            createdAt: {
              gte: dateFilter,
            },
          }),
        },
        orderBy: {
          _count: {
            modelId: "desc",
          },
        },
        take: limit,
      });

      const totalMessages = messages.reduce(
        (sum, model) => sum + model._count.modelId,
        0,
      );

      return messages.map((model, index) => {
        const separator = model.modelId.includes(":") ? ":" : "/";
        const parts = model.modelId.split(separator);

        return {
          rank: index + 1,
          modelId: model.modelId,
          messageCount: model._count.modelId,
          percentage:
            totalMessages > 0
              ? ((model._count.modelId / totalMessages) * 100).toFixed(1)
              : "0",
          provider: parts[0] ?? "unknown",
          modelName: parts[1] ?? model.modelId,
        };
      });
    }),

  getProviderMarketShare: publicProcedure
    .input(
      z.object({
        timeframe: z.enum(["today", "week", "month", "all"]).default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeframe } = input;

      const now = new Date();
      let dateFilter: Date | undefined;

      switch (timeframe) {
        case "today":
          dateFilter = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "week":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = undefined;
      }

      const messages = await ctx.db.message.findMany({
        where: {
          role: "assistant",
          ...(dateFilter && {
            createdAt: {
              gte: dateFilter,
            },
          }),
        },
        select: {
          modelId: true,
        },
      });

      // Group by provider
      const providerCounts = messages.reduce(
        (acc, message) => {
          const separator = message.modelId.includes(":") ? ":" : "/";
          const provider = message.modelId.split(separator)[0] ?? "unknown";
          acc[provider] = (acc[provider] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalMessages = messages.length;

      return Object.entries(providerCounts)
        .map(([provider, count]) => ({
          provider,
          messageCount: count,
          percentage:
            totalMessages > 0
              ? ((count / totalMessages) * 100).toFixed(1)
              : "0",
        }))
        .sort((a, b) => b.messageCount - a.messageCount);
    }),

  getOverallStats: publicProcedure
    .input(
      z.object({
        timeframe: z.enum(["today", "week", "month", "all"]).default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeframe } = input;

      const now = new Date();
      let dateFilter: Date | undefined;

      switch (timeframe) {
        case "today":
          dateFilter = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "week":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = undefined;
      }

      const [totalMessages, uniqueModels, uniqueProviders] = await Promise.all([
        ctx.db.message.count({
          where: {
            role: "assistant",
            ...(dateFilter && {
              createdAt: {
                gte: dateFilter,
              },
            }),
          },
        }),
        ctx.db.message.findMany({
          where: {
            role: "assistant",
            ...(dateFilter && {
              createdAt: {
                gte: dateFilter,
              },
            }),
          },
          select: {
            modelId: true,
          },
          distinct: ["modelId"],
        }),
        ctx.db.message.findMany({
          where: {
            role: "assistant",
            ...(dateFilter && {
              createdAt: {
                gte: dateFilter,
              },
            }),
          },
          select: {
            modelId: true,
          },
        }),
      ]);

      const providers = new Set(
        uniqueProviders.map((m) => {
          const separator = m.modelId.includes(":") ? ":" : "/";
          return m.modelId.split(separator)[0] ?? "unknown";
        }),
      );

      return {
        totalMessages,
        uniqueModels: uniqueModels.length,
        uniqueProviders: providers.size,
        timeframe,
      };
    }),
});
