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
  description: "A code artifact for writing, editing, and executing code snippets.",
  
  initialize: async ({ documentId, setMetadata }) => {
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
        const newContent = draftArtifact.content + (streamPart.content as string);
        const lineCount = newContent.split('\n').length;
        
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading code artifact...</span>
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
              <h4 className="text-sm font-medium text-gray-600 mb-2">Previous Version</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{oldContent}</code>
                </pre>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Current Version</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-sm font-mono overflow-x-auto">
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
              <span>Last executed: {metadata.lastExecuted.toLocaleTimeString()}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={executeCode}
              disabled={!isCurrentVersion || metadata.isExecuting}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>{metadata.isExecuting ? "Running..." : "Run"}</span>
            </button>
          </div>
        </div>
        
        <div className="border rounded-lg bg-gray-900">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg">
            <span className="text-white text-sm">Language: {metadata.language}</span>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => onSaveContent(e.target.value)}
            className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm border-0 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="// Write your code here..."
            disabled={!isCurrentVersion}
            spellCheck={false}
          />
        </div>
        
        {status === "streaming" && (
          <div className="flex items-center text-sm text-green-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
            Generating code...
          </div>
        )}
      </div>
    );
  },

  actions: [
    {
      icon: <RefreshCw className="w-4 h-4" />,
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
      icon: <Copy className="w-4 h-4" />,
      description: "Copy code",
      onClick: () => {
        toast.success("Code copied to clipboard!");
      },
    },
    {
      icon: <Download className="w-4 h-4" />,
      description: "Download file",
      onClick: () => {
        toast.success("File downloaded!");
      },
    },
  ],
});
