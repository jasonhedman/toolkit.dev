import { auth } from "@/server/auth";
import { createServerToolkit } from "@/toolkits/create-toolkit";

import { baseFileRagToolkitConfig } from "./base";
import { FileRagTools } from "./tools";
import { fileRagSearchUploadedFilesToolConfigServer } from "./tools/server";

export const fileRagToolkitServer = createServerToolkit(
  baseFileRagToolkitConfig,
  `You have access to the File Search toolkit for retrieval over the user's indexed uploads. This toolkit provides:

- **Search Uploaded Files**: Find relevant chunks from PDFs and image uploads that the user opted in to index

Use this toolkit when the user asks about uploaded files, documents, PDFs, screenshots, or images. Search first, then answer from the returned chunks. Include file names when citing or summarizing retrieved information. If no results are found, explain that the relevant upload may not have been indexed yet.`,
  async () => {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("User not found");
    }

    return {
      [FileRagTools.SearchUploadedFiles]:
        fileRagSearchUploadedFilesToolConfigServer(session.user.id),
    };
  },
);
