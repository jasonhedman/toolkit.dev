import { type baseGenerateTool } from "./base";
import type { ServerToolConfig } from "@/toolkits/types";
import { put } from "@vercel/blob";
import { api } from "@/trpc/server";
import type { imageParameters } from "../../base";
import type z from "zod";
import { generateImage, type GenerateImageResult } from "@/ai/image/generate";

export const generateToolConfigServer = (
  parameters: z.infer<typeof imageParameters>,
): ServerToolConfig<
  typeof baseGenerateTool.inputSchema.shape,
  typeof baseGenerateTool.outputSchema.shape
> => {
  return {
    callback: async ({ prompt }) => {
  const { image, images }: GenerateImageResult = await generateImage(parameters.model, prompt);
      const first = image ?? images?.[0];
      if (!first) throw new Error("No image generated");

      // Prefer uint8Array if present; otherwise decode base64
      let bytes: Uint8Array | undefined;
      if (first.uint8Array) bytes = first.uint8Array;
      else if (first.base64) {
        const b64 = first.base64.includes(",")
          ? first.base64.split(",")[1]!
          : first.base64;
        bytes = Uint8Array.from(Buffer.from(b64, "base64"));
      }
      if (!bytes) throw new Error("Unsupported image data format");
      const mimeType = first.mediaType ?? "image/png";
      const imageId = crypto.randomUUID();
      const ext = mimeType.split("/")[1] ?? "png";
      const fileName = `images/${imageId}.${ext}`;
      const file = new File([Buffer.from(bytes)], fileName, { type: mimeType });
      const { url } = await put(file.name, file, { access: "public" });
      await api.images.createImage({ url, contentType: mimeType });
      return { url };
    },
  };
};
