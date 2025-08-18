import { Artifact } from "@/lib/artifacts/artifact";
import type { ArtifactMetadata } from "@/lib/artifacts/types";
import { Play, Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CodeArtifactMetadata extends ArtifactMetadata {
  language: string;
  lineCount: number;
  lastExecuted?: Date;
  isExecuting: boolean;
}

export const codeArtifact = new Artifact<"code", CodeArtifactMetadata>({
  kind: "code",
  description:
    "A code artifact for writing, editing, and executing code snippets.",

  initialize: async ({ documentId: _documentId, setMetadata }) => {
    setMetadata({
      language: "javascript",
      lineCount: 0,
      isExecuting: false,
    });
  },

  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "language-update") {
      setMetadata((metadata) => ({
        ...metadata,
        language: streamPart.content as string,
      }));
    }

    if (streamPart.type === "content-update") {
      setArtifact((draftArtifact) => {
        const newContent =
          draftArtifact.content + (streamPart.content as string);
        const lineCount = newContent.split("\n").length;

        setMetadata((metadata) => ({
          ...metadata,
          lineCount,
        }));

        return {
          ...draftArtifact,
          content: newContent,
          status: "streaming",
        };
      });
    }
  },

  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Loading code artifact...
          </span>
        </div>
      );
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Code Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Previous Version
              </h4>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <pre className="overflow-x-auto font-mono text-sm">
                  <code>{oldContent}</code>
                </pre>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Current Version
              </h4>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <pre className="overflow-x-auto font-mono text-sm">
                  <code>{newContent}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const executeCode = async () => {
      // TODO: Implement code execution using E2B or similar service
      toast.info("Code execution coming soon!");
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Language: {metadata.language}</span>
            <span>Lines: {metadata.lineCount}</span>
            {metadata.lastExecuted && (
              <span>
                Last executed: {metadata.lastExecuted.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={executeCode}
              disabled={!isCurrentVersion || metadata.isExecuting}
              className="flex items-center space-x-1 rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              <span>{metadata.isExecuting ? "Running..." : "Run"}</span>
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-gray-900">
          <div className="flex items-center justify-between rounded-t-lg bg-gray-800 px-4 py-2">
            <span className="text-sm text-white">
              Language: {metadata.language}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => onSaveContent(e.target.value)}
            className="h-96 w-full resize-none rounded-b-lg border-0 bg-gray-900 p-4 font-mono text-sm text-green-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="// Write your code here..."
            disabled={!isCurrentVersion}
            spellCheck={false}
          />
        </div>

        {status === "streaming" && (
          <div className="flex items-center text-sm text-green-600">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-green-600"></div>
            Generating code...
          </div>
        )}
      </div>
    );
  },

  actions: [
    {
      icon: <RefreshCw className="h-4 w-4" />,
      description: "Regenerate code",
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Please regenerate and improve this code.",
        });
      },
    },
  ],

  toolbar: [
    {
      icon: <Copy className="h-4 w-4" />,
      description: "Copy code",
      onClick: () => {
        toast.success("Code copied to clipboard!");
      },
    },
    {
      icon: <Download className="h-4 w-4" />,
      description: "Download file",
      onClick: () => {
        toast.success("File downloaded!");
      },
    },
  ],
});
