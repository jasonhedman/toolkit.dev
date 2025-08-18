import { z } from "zod";

import type { InferUITools, UIDataTypes, UIMessage } from "ai";
import type { ClientToolkits } from "@/toolkits/toolkits/client";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { UseChatHelpers } from "@ai-sdk/react";

export const metadataSchema = z.object({
  model: z.object({
    name: z.string(),
    provider: z.string(),
    modelId: z.string(),
  }),
});

type Metadata = z.infer<typeof metadataSchema>;

export type FlatToolsWithPrefix = {
  [K in Toolkits]: {
    [T in keyof ClientToolkits[K]["tools"]]: `${K}_${string & T}` extends `${K}_${infer ToolName}`
      ? Record<ToolName, ClientToolkits[K]["tools"][T]>
      : never;
  };
}[Toolkits];

// Flatten the nested structure
export type FlattenedTools = {
  [K in keyof FlatToolsWithPrefix]: FlatToolsWithPrefix[K] extends Record<
    string,
    infer V
  >
    ? V
    : never;
}[keyof FlatToolsWithPrefix];

type Tools = InferUITools<FlattenedTools>;

export type ChatMessage = UIMessage<Metadata, UIDataTypes, Tools>;

export type ChatHelpers = UseChatHelpers<ChatMessage>;
