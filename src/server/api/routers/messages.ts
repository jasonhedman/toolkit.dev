import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { FILE_NAME_MAX_LENGTH } from "@/lib/constants";
import { languageModels } from "@/ai/language";

const messagePartSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("reasoning"),
    reasoning: z.string(),
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
    mimeType: z.string(),
    data: z.string(),
  }),
  z.object({
    type: z.literal("step-start"),
  }),
]);
export const messagesRouter = createTRPCRouter({
  getTopModelUsage: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(25),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 25;

      const [modelRows, totalMessages] = await Promise.all([
        ctx.db.message.groupBy({
          by: ["modelId"],
          where: {
            role: "assistant",
          },
          _count: {
            _all: true,
          },
          orderBy: {
            _count: {
              modelId: "desc",
            },
          },
          take: limit,
        }),
        ctx.db.message.count({
          where: {
            role: "assistant",
          },
        }),
      ]);

      return {
        totalMessages,
        models: modelRows.map((row) => {
          const resolvedModel = resolveModel(row.modelId);
          const count = row._count._all;

          return {
            ...resolvedModel,
            count,
            percentage:
              totalMessages === 0
                ? 0
                : Math.round((count / totalMessages) * 1000) / 10,
          };
        }),
      };
    }),

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

function resolveModel(storedModelId: string) {
  const separatorIndex = getModelSeparatorIndex(storedModelId);
  const provider =
    separatorIndex > 0 ? storedModelId.slice(0, separatorIndex) : "unknown";
  const providerModelId =
    separatorIndex > 0
      ? storedModelId.slice(separatorIndex + 1)
      : storedModelId;
  const model = languageModels.find(
    (model) =>
      model.provider === provider &&
      (model.modelId === providerModelId ||
        `${model.provider}/${model.modelId}` === storedModelId ||
        `${model.provider}:${model.modelId}` === storedModelId),
  );

  return {
    modelId: storedModelId,
    provider,
    providerModelId,
    name: model?.name ?? formatModelName(providerModelId),
    description: model?.description,
    contextLength: model?.contextLength,
    capabilities: model?.capabilities ?? [],
  };
}

function getModelSeparatorIndex(modelId: string) {
  const slashIndex = modelId.indexOf("/");
  const colonIndex = modelId.indexOf(":");

  if (slashIndex === -1) {
    return colonIndex;
  }

  if (colonIndex === -1) {
    return slashIndex;
  }

  return Math.min(slashIndex, colonIndex);
}

function formatModelName(modelId: string) {
  return modelId
    .split(/[-_:/.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
