import { z } from "zod";

import { languageModels } from "@/ai/models";

import type { providers } from "@/ai/registry";
import { Servers } from "@/toolkits/toolkits/shared";
import { serverToolkits } from "@/toolkits/toolkits/server";

const textPartSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(["text"]),
});

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(["user"]),
    content: z.string().min(1).max(2000),
    parts: z.array(textPartSchema),
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1).max(2000),
          contentType: z.enum([
            "image/png",
            "image/jpg",
            "image/jpeg",
            "application/pdf",
          ]),
        }),
      )
      .optional(),
  }),
  selectedChatModel: z.enum(
    languageModels.map((model) => `${model.provider}:${model.modelId}`) as [
      `${keyof typeof providers}:${string}`,
      ...`${keyof typeof providers}:${string}`[],
    ],
  ),
  selectedVisibilityType: z.enum(["public", "private"]),
  useNativeSearch: z.boolean(),
  toolkits: z.array(
    z
      .object({
        id: z.nativeEnum(Servers),
        parameters: z.record(z.string(), z.any()),
      })
      .refine((toolkit) => {
        return toolkit.id in serverToolkits;
      })
      .refine((toolkit) => {
        return serverToolkits[toolkit.id].parameters?.parse(toolkit.parameters);
      }),
  ),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
