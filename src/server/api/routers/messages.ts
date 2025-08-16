import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { FILE_NAME_MAX_LENGTH } from "@/lib/constants";

const messagePartSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("reasoning"),
    reasoningText: z.string(),
    details: z.array(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("text"),
          text: z.string(),
          signature: z.string().optional(),
        }),
        z.object({
          type: z.literal("redacted"),
          data: z.string(),
        }),
      ]),
    ),
  }),
  z.object({
    type: z.literal("tool-invocation"),
    toolInvocation: z.any(), // TODO: Add proper tool invocation schema
  }),
  z.object({
    type: z.literal("source"),
    source: z.any(), // TODO: Add proper source schema
  }),
  z.object({
    type: z.literal("file"),
  url: z.string().url(),
  filename: z.string().optional(),
  mediaType: z.enum(["image/png", "image/jpg", "image/jpeg", "application/pdf"]).optional(),
  }),
  z.object({
    type: z.literal("step-start"),
  }),
]);
export const messagesRouter = createTRPCRouter({
  getMessagesForChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { chatId } = input;

      const items = await ctx.db.message.findMany({
        where: {
          chatId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return items;
    }),

  getMessageCountByUserId: protectedProcedure.query(async ({ ctx }) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const userId = ctx.session.user.id;

    return ctx.db.message.count({
      where: {
        chat: {
          userId,
        },
        createdAt: {
          gte: twentyFourHoursAgo,
        },
        role: "user",
      },
    });
  }),

  createMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        parts: z.array(messagePartSchema),
        attachments: z.array(
          z.object({
            url: z.string().url(),
            name: z.string().min(1).max(FILE_NAME_MAX_LENGTH),
            contentType: z.enum([
              "image/png",
              "image/jpg",
              "image/jpeg",
              "application/pdf",
            ]),
          }),
        ),
        modelId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.message.create({
        data: {
          id: input.id,
          chatId: input.chatId,
          role: input.role,
          parts: input.parts,
          attachments: input.attachments,
          modelId: input.modelId,
        },
      });
    }),

  deleteMessage: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.message.delete({
        where: { id: input },
      });
    }),

  deleteMessagesAfterTimestamp: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        timestamp: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.message.deleteMany({
        where: { chatId: input.chatId, createdAt: { lt: input.timestamp } },
      });
    }),
});
