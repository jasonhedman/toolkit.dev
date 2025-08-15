import { Artifact } from "@/lib/artifacts/artifact";
import type { ArtifactMetadata } from "@/lib/artifacts/types";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CustomArtifactMetadata extends ArtifactMetadata {
  info: string;
  customData: Record<string, unknown>;
}

export const customArtifact = new Artifact<"custom", CustomArtifactMetadata>({
  kind: "custom",
  description: "A custom artifact for demonstrating extensible functionality.",
  
  initialize: async ({ documentId, setMetadata }) => {
    setMetadata({
      info: `Custom document ${documentId} initialized.`,
      customData: {},
    });
  },

  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "info-update") {
      setMetadata((metadata) => ({
        ...metadata,
        info: streamPart.content as string,
      }));
    }
    
    if (streamPart.type === "content-update") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + (streamPart.content as string),
        status: "streaming",
      }));
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading custom artifact...</span>
        </div>
      );
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);
      
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Custom Content Comparison</h3>
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
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-800">Custom Artifact</h3>
          </div>
          <p className="text-sm text-purple-600 mt-2">{metadata.info}</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Content
          </label>
          <textarea
            value={content}
            onChange={(e) => onSaveContent(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your custom content here..."
            disabled={!isCurrentVersion}
          />
        </div>
        
        {status === "streaming" && (
          <div className="flex items-center text-sm text-purple-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
            Generating custom content...
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Content copied to clipboard!");
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Copy Content
          </button>
          <button
            onClick={() => {
              toast.info("Custom action triggered!");
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Custom Action
          </button>
        </div>
      </div>
    );
  },

  actions: [
    {
      icon: <RefreshCw className="w-4 h-4" />,
      description: "Refresh custom artifact",
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Please refresh and update my custom artifact content.",
        });
      },
    },
  ],

  toolbar: [
    {
      icon: <Sparkles className="w-4 h-4" />,
      description: "Enhance with AI",
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Please enhance this custom artifact with additional features.",
        });
      },
    },
  ],
});
