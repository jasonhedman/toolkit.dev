import type {
  ArtifactDefinition,
  ArtifactKind,
  ArtifactMetadata,
  ArtifactInitializeProps,
  ArtifactStreamPartProps,
  ArtifactRenderProps,
  ArtifactAction,
} from "./types";

export class Artifact<
  K extends ArtifactKind = ArtifactKind,
  T extends ArtifactMetadata = ArtifactMetadata,
> implements ArtifactDefinition<K, T>
{
  public readonly kind: K;
  public readonly description: string;
  public readonly initialize?: (
    props: ArtifactInitializeProps,
  ) => Promise<void>;
  public readonly onStreamPart?: (props: ArtifactStreamPartProps<T>) => void;
  public readonly content: (props: ArtifactRenderProps<T>) => React.ReactNode;
  public readonly actions?: ArtifactAction[];
  public readonly toolbar?: ArtifactAction[];

  constructor(definition: ArtifactDefinition<K, T>) {
    this.kind = definition.kind;
    this.description = definition.description;
    this.initialize = definition.initialize;
    this.onStreamPart = definition.onStreamPart;
    this.content = definition.content;
    this.actions = definition.actions;
    this.toolbar = definition.toolbar;
  }
}
