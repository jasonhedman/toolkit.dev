"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Edit3, Copy, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

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
  
  const { data: document, isLoading } = api.documents.get.useQuery(
    { id: documentId },
    { enabled: !!documentId }
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

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteDocument.mutate({ id: documentId });
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "code":
        return "bg-green-100 text-green-800";
      case "custom":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case "text":
        return "📝";
      case "code":
        return "💻";
      case "custom":
        return "✨";
      default:
        return "📄";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getKindIcon(kind)}</span>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getKindColor(kind)}>{kind}</Badge>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {document?.content && (
        <CardContent className="pt-0">
          <div className="border rounded-lg bg-gray-50">
            {isExpanded ? (
              <div className="p-4 max-h-96 overflow-auto">
                {kind === "code" ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    <code>{document.content}</code>
                  </pre>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">
                    {document.content}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="text-sm text-gray-600 line-clamp-3">
                  {document.content.substring(0, 200)}
                  {document.content.length > 200 && "..."}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="p-0 mt-2 h-auto text-blue-600"
                >
                  Show full content
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
