import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { FILE_NAME_MAX_LENGTH } from "@/lib/constants";

import { type Prisma } from "@prisma/client";

const messagePartSchema = z.discriminatedUnion("type", [
  // TextUIPart
  z.object({
    type: z.literal("text"),
    text: z.string(),
    state: z.enum(["streaming", "done"]).optional(),
  }),
  // ReasoningUIPart
  z.object({
    type: z.literal("reasoning"),
    text: z.string(),
    state: z.enum(["streaming", "done"]).optional(),
    providerMetadata: z.record(z.any()).optional(),
  }),
  // SourceUrlUIPart
  z.object({
    type: z.literal("source-url"),
    sourceId: z.string(),
    url: z.string().url(),
    title: z.string().optional(),
    providerMetadata: z.record(z.any()).optional(),
  }),
  // SourceDocumentUIPart
  z.object({
    type: z.literal("source-document"),
    sourceId: z.string(),
    mediaType: z.string(),
    title: z.string(),
    filename: z.string().optional(),
    providerMetadata: z.record(z.any()).optional(),
  }),
  // FileUIPart
  z.object({
    type: z.literal("file"),
    mediaType: z.string(),
    filename: z.string().optional(),
    url: z.string(),
  }),
  // StepStartUIPart
  z.object({
    type: z.literal("step-start"),
  }),
  // ToolUIPart: Accepts any "tool-*" type, with required fields and state-specific fields.
  z.object({
    type: z.string().regex(/^tool-.+/),
    toolCallId: z.string(),
    state: z.enum([
      "input-streaming",
      "input-available",
      "output-available",
      "output-error",
    ]),
    input: z.unknown(),
    output: z.unknown().optional(),
    errorText: z.string().optional(),
    providerExecuted: z.boolean().optional(),
  }),
  // DataUIPart: Used for streaming data events (e.g., appendMessage, error, etc.)
  z.object({
    type: z.string().regex(/^data-.+/),
    id: z.string().optional(),
    data: z.unknown(),
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
          parts: input.parts as Prisma.InputJsonValue,
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
