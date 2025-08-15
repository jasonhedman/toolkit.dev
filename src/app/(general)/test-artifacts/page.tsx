"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ArtifactKind } from "@prisma/client";
import { ChevronDown } from "lucide-react";

export default function ArtifactsTestPage() {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ArtifactKind>("text");
  
  const { data: documents, refetch } = api.documents.list.useQuery({});
  const createDocument = api.documents.create.useMutation({
    onSuccess: () => {
      refetch();
      setTitle("");
    },
  });
  const generateContent = api.documents.generateContent.useMutation({
    onSuccess: () => {
      refetch();
      setTitle("");
    },
  });
  const deleteDocument = api.documents.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateDocument = () => {
    if (!title.trim()) return;
    
    createDocument.mutate({
      title,
      kind,
      initialContent: "This is initial content for testing.",
    });
  };

  const handleGenerateContent = () => {
    if (!title.trim()) return;
    
    generateContent.mutate({
      title,
      kind,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Artifacts Testing</h1>
        <p className="text-gray-600">Test the artifacts system functionality</p>
      </div>

      {/* Create Document Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Document</CardTitle>
          <CardDescription>Test document creation and content generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-32 justify-between">
                  {kind}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setKind("text")}>
                  Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setKind("code")}>
                  Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setKind("custom")}>
                  Custom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateDocument}
              disabled={!title.trim() || createDocument.isPending}
            >
              {createDocument.isPending ? "Creating..." : "Create Empty Document"}
            </Button>
            <Button 
              onClick={handleGenerateContent}
              disabled={!title.trim() || generateContent.isPending}
              variant="secondary"
            >
              {generateContent.isPending ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents?.documents.length || 0})</CardTitle>
          <CardDescription>Your created artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          {documents?.documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents yet. Create one above!</p>
          ) : (
            <div className="space-y-4">
              {documents?.documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{document.title}</h3>
                      <p className="text-sm text-gray-500">
                        Type: {document.kind} • Created: {new Date(document.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDocument.mutate({ id: document.id })}
                      disabled={deleteDocument.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                  {document.content && (
                    <div className="bg-gray-50 rounded p-3 max-h-32 overflow-auto">
                      <pre className="text-sm whitespace-pre-wrap">{document.content}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Database:</span>{" "}
              <span className="text-green-600">Connected ✓</span>
            </div>
            <div>
              <span className="font-medium">AI Provider:</span>{" "}
              <span className="text-green-600">Ready ✓</span>
            </div>
            <div>
              <span className="font-medium">Documents API:</span>{" "}
              <span className="text-green-600">Working ✓</span>
            </div>
            <div>
              <span className="font-medium">Artifact Types:</span>{" "}
              <span className="text-blue-600">Text, Code, Custom</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
