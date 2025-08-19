# Changelog

## 2025-08-16

- Build and type fixes following ai v5/@ai-sdk/react v2 migration:
	- Correctly type `UseChatHelpers<UIMessage>` in chat input/components.
	- Guard undefined `toolName` and fix `append` signature in MessageTool.
	- Safe reasoning text extraction and switch to `??` to satisfy ESLint.
- API: Fix file-part type narrowing in `/api/chat` to match zod schema (resolves type predicate error in build).
- Prisma: Add `binaryTargets = ["native", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]` to resolve query engine mismatch; regenerated client.
- Build: Verified `next build` passes lint and type checks.
- Action item: After pulling, run `pnpm prisma generate` to refresh the Prisma Client for your platform.

## 2025-08-15

- Migrate to ai v5 and @ai-sdk/react v2.
- Switch to parts-based UIMessage (text, file, reasoning, tool-invocation).
- Server streaming refactor using result.toUIMessageStream.
- Removed experimental_attachments in favor of file parts.
- Preserved DB persistence and resumable streaming.
- Improved setup resiliency (Docker/DB optional in dev).
