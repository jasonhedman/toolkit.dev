import { z } from "zod";

import { NextResponse } from "next/server";

import { put } from "@vercel/blob";

import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { FILE_MAX_SIZE, IS_DEVELOPMENT } from "@/lib/constants";
import { indexUploadedFile } from "@/server/rag/files";

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= FILE_MAX_SIZE, {
      message: "File size should be less than 5MB",
    })
    // Update the file type based on the kind of files you want to accept
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File type should be JPEG, PNG, or PDF",
      },
    ),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get("file") as File).name;
    const shouldIndexFile = formData.get("indexFile") === "true";
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(
        `${session.user.id}/${crypto.randomUUID()}`,
        fileBuffer,
        {
          access: "public",
        },
      );

      const file = await api.files.createFile({
        name: filename,
        url: data.url,
        contentType: validatedFile.data.file.type,
        embeddingStatus: shouldIndexFile ? "indexing" : "skipped",
      });

      if (shouldIndexFile) {
        file.embeddingStatus = await indexUploadedFile({
          fileId: file.id,
          userId: session.user.id,
          name: filename,
          contentType: validatedFile.data.file.type,
          arrayBuffer: fileBuffer,
        });
      }

      if (IS_DEVELOPMENT) {
        // In development, use base64 data URLs so openrouter can access the file
        // We can't use the local blob storage because it's not accessible to openrouter
        const base64 = Buffer.from(fileBuffer).toString("base64");
        const fileUrl = `data:${validatedFile.data.file.type};base64,${base64}`;
        file.url = fileUrl;
      }

      return NextResponse.json(file);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
