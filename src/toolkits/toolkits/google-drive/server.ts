import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseGoogleDriveToolkitConfig } from "./base";
import {
  googleDriveSearchFilesToolConfigServer,
  googleDriveReadFileToolConfigServer,
} from "./tools/server";
import { GoogleDriveTools } from "./tools";
import { api } from "@/trpc/server";

export const googleDriveToolkitServer = createServerToolkit(
  baseGoogleDriveToolkitConfig,
  `You have access to the Google Drive toolkit for file management and content access. This toolkit provides:

- **Search Files**: Find files and folders in Google Drive using various search criteria
- **Read File**: Extract and read content from documents, PDFs, and other supported file types

**Tool Sequencing Workflows:**
1. **File Discovery**: Use Search Files to locate documents by name, type, or content, then Read File to access specific content
2. **Content Analysis**: Search for files by topic or keywords, then read multiple files to gather comprehensive information
3. **Document Research**: Find relevant documents through search, then read them to extract specific information or insights

**Best Practices:**
- Use specific search terms and file type filters (e.g., "type:pdf", "type:document") for better results
- Search by modification date or owner when looking for recent or specific documents
- When reading files, be aware of file format limitations and supported document types
- Combine search results from multiple queries to get comprehensive document coverage
- Use folder-based searches when documents are organized in specific directory structures`,
  async () => {
    const account = await api.accounts.getAccountByProvider("google");

    if (!account?.access_token) {
      throw new Error("No Google account found or access token missing");
    }

    if (!account.scope?.includes("drive.readonly")) {
      throw new Error("Google account does not have drive.readonly scope");
    }

    return {
      [GoogleDriveTools.SearchFiles]: googleDriveSearchFilesToolConfigServer(
        account.access_token,
      ),
      [GoogleDriveTools.ReadFile]: googleDriveReadFileToolConfigServer(
        account.access_token,
      ),
    };
  },
);
