import type { ArtifactKind } from "@prisma/client";
import type { ArtifactDocument } from "./types";
import { textDocumentHandler } from "@/artifacts/text/server";
import { codeDocumentHandler } from "@/artifacts/code/server";
import { customDocumentHandler } from "@/artifacts/custom/server";

export interface DataStream {
  writeData: (data: { type: string; content: unknown }) => void;
}

export interface CreateDocumentProps {
  title: string;
  dataStream: DataStream;
}

export interface UpdateDocumentProps {
  document: ArtifactDocument;
  description: string;
  dataStream: DataStream;
}

export interface DocumentHandler<K extends ArtifactKind = ArtifactKind> {
  kind: K;
  onCreateDocument: (props: CreateDocumentProps) => Promise<string>;
  onUpdateDocument: (props: UpdateDocumentProps) => Promise<string>;
}

export function createDocumentHandler<K extends ArtifactKind>(
  handler: DocumentHandler<K>,
): DocumentHandler<K> {
  return handler;
}

export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  customDocumentHandler,
];

export const artifactKinds = ["text", "code", "custom"] as const;
