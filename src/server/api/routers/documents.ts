import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { documentHandlersByArtifactKind } from "@/lib/artifacts/server";
import { ArtifactKind } from "@prisma/client";

export const documentsRouter = createTRPCRouter({
  // Get all documents for a user
  list: protectedProcedure
    .input(
      z.object({
        chatId: z.string().optional(),
        kind: z.enum(["text", "code", "custom"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.document.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.chatId && { chatId: input.chatId }),
          ...(input.kind && { kind: input.kind }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          chat: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (documents.length > input.limit) {
        const nextItem = documents.pop();
        nextCursor = nextItem!.id;
      }

      return {
        documents,
        nextCursor,
      };
    }),

  // Get a specific document
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.document.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          chat: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return document;
    }),

  // Create a new document
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        kind: z.enum(["text", "code", "custom"]),
        chatId: z.string().optional(),
        initialContent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.create({
        data: {
          title: input.title,
          kind: input.kind,
          content: input.initialContent || "",
          userId: ctx.session.user.id,
          chatId: input.chatId,
        },
      });

      return document;
    }),

  // Update document content
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().optional(),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      const updatedDocument = await ctx.db.document.update({
        where: { id: input.id },
        data: {
          ...(input.content !== undefined && { content: input.content }),
          ...(input.title !== undefined && { title: input.title }),
          updatedAt: new Date(),
        },
      });

      return updatedDocument;
    }),

  // Delete a document
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      await ctx.db.document.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Generate content for a document using AI
  generateContent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        kind: z.enum(["text", "code", "custom"]),
        chatId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find the appropriate document handler
      const handler = documentHandlersByArtifactKind.find(
        (h) => h.kind === input.kind,
      );

      if (!handler) {
        throw new Error(`No handler found for artifact kind: ${input.kind}`);
      }

      // Create the document first
      const document = await ctx.db.document.create({
        data: {
          title: input.title,
          kind: input.kind,
          content: "",
          userId: ctx.session.user.id,
          chatId: input.chatId,
        },
      });

      // Mock data stream for now (in real implementation, this would be streamed)
      const dataStream = {
        writeData: (data: { type: string; content: unknown }) => {
          console.log("Stream data:", data);
        },
      };

      try {
        // Generate content using the handler
        const content = await handler.onCreateDocument({
          title: input.title,
          dataStream,
        });

        // Update the document with the generated content
        const updatedDocument = await ctx.db.document.update({
          where: { id: document.id },
          data: { content },
        });

        return updatedDocument;
      } catch (error) {
        // If generation fails, delete the document
        await ctx.db.document.delete({
          where: { id: document.id },
        });
        throw error;
      }
    }),
});
