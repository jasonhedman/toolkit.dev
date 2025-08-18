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
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Loading custom artifact...
          </span>
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
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Previous Version
              </h4>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <pre className="text-sm whitespace-pre-wrap">{oldContent}</pre>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Current Version
              </h4>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <pre className="text-sm whitespace-pre-wrap">{newContent}</pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 p-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-800">
              Custom Artifact
            </h3>
          </div>
          <p className="mt-2 text-sm text-purple-600">{metadata.info}</p>
        </div>

        <div className="rounded-lg border p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Custom Content
          </label>
          <textarea
            value={content}
            onChange={(e) => onSaveContent(e.target.value)}
            className="h-64 w-full resize-none rounded-lg border p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Enter your custom content here..."
            disabled={!isCurrentVersion}
          />
        </div>

        {status === "streaming" && (
          <div className="flex items-center text-sm text-purple-600">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-purple-600"></div>
            Generating custom content...
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => {
              void navigator.clipboard.writeText(content);
              toast.success("Content copied to clipboard!");
            }}
            className="rounded bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
          >
            Copy Content
          </button>
          <button
            onClick={() => {
              toast.info("Custom action triggered!");
            }}
            className="rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Custom Action
          </button>
        </div>
      </div>
    );
  },

  actions: [
    {
      icon: <RefreshCw className="h-4 w-4" />,
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
      icon: <Sparkles className="h-4 w-4" />,
      description: "Enhance with AI",
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content:
            "Please enhance this custom artifact with additional features.",
        });
      },
    },
  ],
});
