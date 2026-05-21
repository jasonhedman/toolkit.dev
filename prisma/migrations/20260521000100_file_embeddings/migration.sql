CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE "FileEmbeddingStatus" AS ENUM ('skipped', 'indexing', 'indexed', 'failed');

ALTER TABLE "File"
ADD COLUMN "embeddingStatus" "FileEmbeddingStatus" NOT NULL DEFAULT 'skipped';

CREATE TABLE "FileEmbeddingChunk" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileEmbeddingChunk_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FileEmbeddingChunk_fileId_chunkIndex_key" ON "FileEmbeddingChunk"("fileId", "chunkIndex");
CREATE INDEX "FileEmbeddingChunk_fileId_idx" ON "FileEmbeddingChunk"("fileId");
CREATE INDEX "FileEmbeddingChunk_userId_idx" ON "FileEmbeddingChunk"("userId");
CREATE INDEX "FileEmbeddingChunk_embedding_idx" ON "FileEmbeddingChunk" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);

ALTER TABLE "FileEmbeddingChunk"
ADD CONSTRAINT "FileEmbeddingChunk_fileId_fkey"
FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
