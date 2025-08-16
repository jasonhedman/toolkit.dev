"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Expand, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { LLMMarkdown } from "./utils/llm-markdown";
import { CodeBlock } from "@/components/ui/code-block";
import type { BundledLanguage } from "@/components/ui/code/shiki.bundle";

interface Props {
  documentId: string;
  title: string;
  kind: "text" | "code" | "custom";
  _description?: string;
}

export const ArtifactPreview: React.FC<Props> = ({
  documentId,
  title,
  kind,
  _description,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: document, isLoading } = api.documents.get.useQuery(
    { id: documentId },
    { enabled: !!documentId },
  );

  const handleCopy = async () => {
    if (document?.content) {
      await navigator.clipboard.writeText(document.content);
      toast.success("Content copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background w-full rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="bg-muted mb-2 h-4 w-1/3 rounded"></div>
          <div className="bg-muted h-20 rounded"></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!document?.content) return null;

    const content = document.content;

    // For code artifacts, use CodeBlock directly with language detection
    if (kind === "code") {
      // Try to detect language from the first line if it has a language comment
      let language: BundledLanguage = "javascript"; // default

      const firstLine = content.split("\n")[0]?.toLowerCase() ?? "";
      if (
        firstLine.includes("// language:") ||
        firstLine.includes("# language:")
      ) {
        const match = /(?:\/\/|#)\s*language:\s*(\w+)/.exec(firstLine);
        if (match?.[1]) {
          const detectedLang = match[1];
          // Map common language names to valid BundledLanguage types
          const langMap: Record<string, BundledLanguage> = {
            go: "go",
            golang: "go",
            javascript: "javascript",
            js: "javascript",
            typescript: "typescript",
            ts: "typescript",
            python: "python",
            py: "python",
            rust: "rust",
            rs: "rust",
            java: "java",
            cpp: "cpp",
            c: "c",
            html: "html",
            css: "css",
            json: "json",
            yaml: "yaml",
            yml: "yaml",
            sql: "sql",
          };
          language = langMap[detectedLang] ?? "javascript";
        }
      }

      return (
        <div className="h-full w-full overflow-auto">
          <CodeBlock
            value={content}
            language={language}
            showLineNumbers={true}
            allowCopy={true}
          />
        </div>
      );
    }

    // For text and custom artifacts, use markdown rendering as-is
    return (
      <div className="h-full w-full overflow-auto">
        <LLMMarkdown llmOutput={content} isStreamFinished={true} />
      </div>
    );
  };

  return (
    <div className="w-full space-y-2">
      <div className="bg-background flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium">{title}</div>
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
            className="bg-background flex h-full max-h-[90vh] w-full max-w-6xl flex-col rounded-lg border shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background flex flex-shrink-0 items-center justify-between border-b p-4">
              <div className="flex items-center space-x-3">
                <div className="text-lg font-semibold">{title}</div>
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
            <div className="bg-background flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto">{renderContent()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
