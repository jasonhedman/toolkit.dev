-- CreateTable
CREATE TABLE "AgentJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "triggerJobId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "toolkits" TEXT[],
    "systemPrompt" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "costInCents" INTEGER,
    "durationMs" INTEGER,

    CONSTRAINT "AgentJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentJob_triggerJobId_key" ON "AgentJob"("triggerJobId");

-- CreateIndex
CREATE INDEX "AgentJob_userId_idx" ON "AgentJob"("userId");

-- CreateIndex
CREATE INDEX "AgentJob_triggerJobId_idx" ON "AgentJob"("triggerJobId");

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
