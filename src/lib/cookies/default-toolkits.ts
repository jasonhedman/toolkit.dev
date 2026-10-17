import { Toolkits } from "@/toolkits/toolkits/shared";
import type { PersistedToolkit } from "./types";

export function resolveInitialToolkits(
  saved: PersistedToolkit[] | undefined,
  hasSearchCredentials: boolean,
  hasNativeSearchPreference: boolean,
): PersistedToolkit[] {
  // An explicitly empty selection is a disabled-tool preference.
  if (saved !== undefined) return saved;
  if (hasSearchCredentials || hasNativeSearchPreference) return [];
  return [{ id: Toolkits.Parallel, parameters: {} }];
}
