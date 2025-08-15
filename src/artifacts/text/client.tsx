import { Artifact } from "@/lib/artifacts/artifact";
import type { ArtifactMetadata } from "@/lib/artifacts/types";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface TextArtifactMetadata extends ArtifactMetadata {
  wordCount: number;
  lastModified: Date;
}

export const textArtifact = new Artifact<"text", TextArtifactMetadata>({
  kind: "text",
  description: "A text artifact for drafting essays, emails, and other written content.",
  
  initialize: async ({ documentId, setMetadata }) => {
    setMetadata({
      wordCount: 0,
      lastModified: new Date(),
    });
  },

  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "content-update") {
      setArtifact((draftArtifact) => {
        const newContent = draftArtifact.content + (streamPart.content as string);
        const wordCount = newContent.split(/\s+/).filter(Boolean).length;
        
        setMetadata((metadata) => ({
          ...metadata,
          wordCount,
          lastModified: new Date(),
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading text artifact...</span>
        </div>
      );
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);
      
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Previous Version</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">{oldContent}</pre>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Current Version</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">{newContent}</pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Words: {metadata.wordCount}</span>
          <span>Last modified: {metadata.lastModified.toLocaleTimeString()}</span>
        </div>
        
        <div className="border rounded-lg">
          <textarea
            value={content}
            onChange={(e) => onSaveContent(e.target.value)}
            className="w-full h-96 p-4 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start writing your content here..."
            disabled={!isCurrentVersion}
          />
        </div>
        
        {status === "streaming" && (
          <div className="flex items-center text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Generating content...
          </div>
        )}
      </div>
    );
  },

  actions: [
    {
      icon: <RefreshCw className="w-4 h-4" />,
      description: "Regenerate content",
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Please regenerate and improve this text content.",
        });
      },
    },
  ],

  toolbar: [
    {
      icon: <Copy className="w-4 h-4" />,
      description: "Copy to clipboard",
      onClick: ({ appendMessage }) => {
        // This would be handled by the parent component
        toast.success("Content copied to clipboard!");
      },
    },
  ],
});
