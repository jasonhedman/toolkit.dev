import { z } from "zod";

import { languageModels } from "@/ai/language";
import { MESSAGE_MAX_LENGTH, FILE_NAME_MAX_LENGTH } from "@/lib/constants";

import { Toolkits } from "@/toolkits/toolkits/shared";
import { clientToolkits } from "@/toolkits/toolkits/client";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

const filePartSchema = z.object({
  type: z.literal("file"),
  url: z.string().url(),
  filename: z.string().min(1).max(FILE_NAME_MAX_LENGTH).optional(),
  mediaType: z.enum(["image/png", "image/jpg", "image/jpeg", "application/pdf"]),
});

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(["user"]),
  content: z.string().max(MESSAGE_MAX_LENGTH).optional().default(""),
  parts: z.array(z.discriminatedUnion("type", [textPartSchema, filePartSchema])),
  }),
  selectedChatModel: z.enum(
    languageModels.map((model) => `${model.provider}/${model.modelId}`) as [
      `${string}/${string}`,
      ...`${string}/${string}`[],
    ],
  ),
  selectedVisibilityType: z.enum(["public", "private"]),
  useNativeSearch: z.boolean(),
  systemPrompt: z.string().optional(),
  workbenchId: z.string().uuid().optional(),
  toolkits: z.array(
    z
      .object({
        id: z.nativeEnum(Toolkits),
        parameters: z.record(z.string(), z.any()),
      })
      .refine((toolkit) => {
        return toolkit.id in clientToolkits;
      })
      .refine((toolkit) => {
        return clientToolkits[toolkit.id].parameters?.parse(toolkit.parameters);
      }),
  ),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
