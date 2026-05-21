import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { refreshAccountAccessTokenIfNeeded } from "@/server/auth/refresh-token";
import { z } from "zod";

export const accountsRouter = createTRPCRouter({
  getAccounts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const items = await ctx.db.account.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      const nextCursor =
        items.length > limit ? items[items.length - 1]?.id : undefined;
      const accounts = items.slice(0, limit);

      return {
        items: accounts,
        hasMore: items.length > limit,
        nextCursor,
      };
    }),

  getAccount: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });

      return refreshAccountAccessTokenIfNeeded(account);
    }),

  getAccountByProvider: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: {
          userId: ctx.session.user.id,
          provider: input,
        },
      });

      return refreshAccountAccessTokenIfNeeded(account);
    }),

  hasProviderAccount: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: { userId: ctx.session.user.id, provider: input },
      });

      return !!account;
    }),

  deleteAccount: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.account.delete({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });
    }),

  updateAccount: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
        providerAccountId: z.string(),
        data: z.object({
          access_token: z.string(),
          refresh_token: z.string(),
          expires_at: z.number(),
          token_type: z.string(),
          scope: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input: { provider, providerAccountId, data } }) => {
      return ctx.db.account.update({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        data,
      });
    }),
});
