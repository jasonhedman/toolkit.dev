import type { ArtifactKind } from "@prisma/client";

export type ArtifactMetadata = Record<string, unknown>;

export type { ArtifactKind };

export interface ArtifactStreamPart {
  type: string;
  content: unknown;
}

export interface ArtifactDocument {
  id: string;
  title: string;
  content: string;
  kind: ArtifactKind;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  chatId?: string | null;
}

export interface ArtifactRenderProps<
  T extends ArtifactMetadata = ArtifactMetadata,
> {
  mode: "view" | "diff";
  status: "idle" | "streaming" | "complete";
  content: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  onSaveContent: (content: string) => void;
  getDocumentContentById: (versionIndex: number) => string;
  isLoading: boolean;
  metadata: T;
}

export interface ArtifactActionProps {
  appendMessage: (message: {
    role: "user" | "assistant";
    content: string;
  }) => void;
}

export interface ArtifactAction {
  icon: React.ReactNode;
  description: string;
  onClick: (props: ArtifactActionProps) => void;
}

export interface ArtifactInitializeProps {
  documentId: string;
  setMetadata: React.Dispatch<React.SetStateAction<ArtifactMetadata>>;
}

export interface ArtifactStreamPartProps<
  T extends ArtifactMetadata = ArtifactMetadata,
> {
  streamPart: ArtifactStreamPart;
  setMetadata: React.Dispatch<React.SetStateAction<T>>;
  setArtifact: React.Dispatch<React.SetStateAction<Partial<ArtifactDocument>>>;
}

export interface ArtifactDefinition<
  K extends ArtifactKind = ArtifactKind,
  T extends ArtifactMetadata = ArtifactMetadata,
> {
  kind: K;
  description: string;
  initialize?: (props: ArtifactInitializeProps) => Promise<void>;
  onStreamPart?: (props: ArtifactStreamPartProps<T>) => void;
  content: (props: ArtifactRenderProps<T>) => React.ReactNode;
  actions?: ArtifactAction[];
  toolbar?: ArtifactAction[];
}
