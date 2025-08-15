"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Expand, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CodeBlock } from "@/components/ui/code-block";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import type { BundledLanguage } from "@/components/ui/code/shiki.bundle";
import { LLMMarkdown } from "./utils/llm-markdown";

interface Props {
  documentId: string;
  title: string;
  kind: "text" | "code" | "custom";
  description?: string;
}

export const ArtifactPreview: React.FC<Props> = ({
  documentId,
  title,
  kind,
  description,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: document, isLoading } = api.documents.get.useQuery(
    { id: documentId },
    { enabled: !!documentId },
  );

  const deleteDocument = api.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Artifact deleted");
    },
    onError: () => {
      toast.error("Failed to delete artifact");
    },
  });

  const handleCopy = async () => {
    if (document?.content) {
      await navigator.clipboard.writeText(document.content);
      toast.success("Content copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full rounded-lg border bg-gray-50 p-4">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
          <div className="h-20 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!document?.content) return null;

    const content = document.content;

    return (
      <div className="h-full w-full overflow-auto">
        <LLMMarkdown llmOutput={content} isStreamFinished={true} />
      </div>
    );
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <Badge variant="secondary" className="text-xs">
            {kind}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="h-8 w-8 p-0"
            title="View artifact"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsFullscreen(false);
            }
          }}
        >
          <div
            className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
              <div className="flex items-center space-x-3">
                <div className="text-lg font-semibold text-gray-900">
                  {title}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {kind}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0"
                  title="Copy content"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="h-8 w-8 p-0"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto">{renderContent()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
