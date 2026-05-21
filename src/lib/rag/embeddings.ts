export const FILE_EMBEDDING_DIMENSIONS = 384;

const MAX_TOKENS = 2_000;
const MAX_CHARACTER_FEATURES = 6_000;

export function embedText(text: string) {
  const vector = new Array<number>(FILE_EMBEDDING_DIMENSIONS).fill(0);
  const normalized = text.normalize("NFKC").toLowerCase();
  const tokens = normalized.match(/[\p{L}\p{N}]+/gu)?.slice(0, MAX_TOKENS);

  if (tokens?.length) {
    tokens.forEach((token) => addFeature(vector, `w:${token}`, 1));

    for (let index = 0; index < tokens.length - 1; index++) {
      addFeature(vector, `b:${tokens[index]!} ${tokens[index + 1]!}`, 0.7);
    }
  }

  const compactText = normalized.replace(/\s+/g, " ");
  const characterFeatureCount = Math.min(
    compactText.length - 2,
    MAX_CHARACTER_FEATURES,
  );

  for (let index = 0; index < characterFeatureCount; index++) {
    addFeature(vector, `c:${compactText.slice(index, index + 3)}`, 0.25);
  }

  normalizeVector(vector);
  return vector;
}

export function toVectorLiteral(vector: number[]) {
  return `[${vector.map((value) => Number(value.toFixed(6))).join(",")}]`;
}

function addFeature(vector: number[], feature: string, weight: number) {
  const hash = hashString(feature);
  const index = hash % FILE_EMBEDDING_DIMENSIONS;
  const sign = hash & 1 ? 1 : -1;
  vector[index] = (vector[index] ?? 0) + sign * weight;
}

function normalizeVector(vector: number[]) {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));

  if (norm === 0) {
    vector[0] = 1;
    return;
  }

  for (let index = 0; index < vector.length; index++) {
    vector[index] = vector[index]! / norm;
  }
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
