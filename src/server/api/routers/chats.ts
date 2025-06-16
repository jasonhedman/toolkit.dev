import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export const chatsRouter = createTRPCRouter({
  getChats: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        workbenchId: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit, cursor, workbenchId } = input;

      const items = await ctx.db.chat.findMany({
        where: {
          userId,
          workbenchId,
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

  getChat: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.chat.findUnique({
        where: {
          id: input,
          OR: [{ userId: ctx.session.user.id }, { visibility: "public" }],
        },
        include: {
          workbench: true,
        },
      });
    }),

  createChat: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        visibility: z.enum(["public", "private"]),
        userId: z.string(),
        workbenchId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chat.create({
        data: input,
      });
    }),

  updateChatVisibility: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        visibility: z.enum(["public", "private"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chat.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: { visibility: input.visibility },
      });
    }),

  updateChatTitle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chat.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: { title: input.title },
      });
    }),

  deleteChat: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chat.delete({
        where: { id: input },
      });
    }),

  branchChat: protectedProcedure
    .input(
      z.object({
        originalChatId: z.string(),
        messageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { originalChatId, messageId } = input;
      const userId = ctx.session.user.id;

      // Get the original chat to verify ownership
      const originalChat = await ctx.db.chat.findUnique({
        where: { id: originalChatId, userId },
      });

      if (!originalChat) {
        throw new Error("Chat not found or access denied");
      }

      // Get all messages up to and including the specified message
      const messagesToCopy = await ctx.db.message.findMany({
        where: {
          chatId: originalChatId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Find the index of the target message
      const messageIndex = messagesToCopy.findIndex(
        (msg) => msg.id === messageId,
      );
      if (messageIndex === -1) {
        throw new Error("Message not found in chat");
      }

      // Keep only messages up to and including the target message
      const messagesToInclude = messagesToCopy.slice(0, messageIndex + 1);

      // Create the new branched chat
      const newChat = await ctx.db.chat.create({
        data: {
          title: originalChat.title,
          userId: userId,
          visibility: originalChat.visibility,
          parentChatId: originalChatId,
        },
      });

      // Copy the messages to the new chat
      await ctx.db.message.createMany({
        data: messagesToInclude.map((message) => ({
          chatId: newChat.id,
          role: message.role,
          parts: message.parts as InputJsonValue,
          attachments: message.attachments as InputJsonValue[],
          modelId: message.modelId,
        })),
      });

      return newChat;
    }),
});
