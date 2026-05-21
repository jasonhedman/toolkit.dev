import "server-only";

import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { db } from "@/server/db";
import { chunkText, getIndexableText } from "@/lib/rag/files";
import { embedText, toVectorLiteral } from "@/lib/rag/embeddings";

type FileEmbeddingStatus = "skipped" | "indexing" | "indexed" | "failed";

type IndexUploadedFileInput = {
  fileId: string;
  userId: string;
  name: string;
  contentType: string;
  arrayBuffer: ArrayBuffer;
};

type SearchIndexedFileChunksInput = {
  userId: string;
  query: string;
  limit?: number;
  fileIds?: string[];
};

type SearchRow = {
  chunkId: string;
  fileId: string;
  fileName: string;
  contentType: string;
  chunkIndex: number;
  content: string;
  score: number | string;
};

export async function indexUploadedFile({
  fileId,
  userId,
  name,
  contentType,
  arrayBuffer,
}: IndexUploadedFileInput): Promise<FileEmbeddingStatus> {
  try {
    const text = getIndexableText({ name, contentType, arrayBuffer });
    const chunks = chunkText(text);

    await db.$executeRaw(
      Prisma.sql`DELETE FROM "FileEmbeddingChunk" WHERE "fileId" = ${fileId}`,
    );

    if (chunks.length === 0) {
      await updateFileEmbeddingStatus(fileId, "failed");
      return "failed";
    }

    for (const [chunkIndex, content] of chunks.entries()) {
      const embedding = toVectorLiteral(embedText(content));

      await db.$executeRaw(
        Prisma.sql`
          INSERT INTO "FileEmbeddingChunk" ("id", "fileId", "userId", "chunkIndex", "content", "embedding")
          VALUES (${randomUUID()}, ${fileId}, ${userId}, ${chunkIndex}, ${content}, ${embedding}::vector)
        `,
      );
    }

    await updateFileEmbeddingStatus(fileId, "indexed");
    return "indexed";
  } catch (error) {
    console.error("Failed to index uploaded file:", error);
    await updateFileEmbeddingStatus(fileId, "failed");
    return "failed";
  }
}

export async function searchIndexedFileChunks({
  userId,
  query,
  limit = 5,
  fileIds,
}: SearchIndexedFileChunksInput) {
  const embedding = toVectorLiteral(embedText(query));
  const sanitizedLimit = Math.min(Math.max(limit, 1), 10);
  const fileFilter = fileIds?.length
    ? Prisma.sql`AND c."fileId" IN (${Prisma.join(fileIds)})`
    : Prisma.empty;

  const rows = await db.$queryRaw<SearchRow[]>(
    Prisma.sql`
      SELECT
        c."id" AS "chunkId",
        c."fileId" AS "fileId",
        f."name" AS "fileName",
        f."contentType" AS "contentType",
        c."chunkIndex" AS "chunkIndex",
        c."content" AS "content",
        1 - (c."embedding" <=> ${embedding}::vector) AS "score"
      FROM "FileEmbeddingChunk" c
      INNER JOIN "File" f ON f."id" = c."fileId"
      WHERE c."userId" = ${userId}
      ${fileFilter}
      ORDER BY c."embedding" <=> ${embedding}::vector
      LIMIT ${sanitizedLimit}
    `,
  );

  return rows.map((row) => ({
    ...row,
    score: Number(row.score),
  }));
}

async function updateFileEmbeddingStatus(
  fileId: string,
  embeddingStatus: FileEmbeddingStatus,
) {
  await db.file.update({
    where: { id: fileId },
    data: { embeddingStatus },
  });
}
