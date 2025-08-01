import type { VideoModel } from "../types";

const lumaVideoModelsData: Omit<VideoModel, "provider">[] = [
  {
    name: "Ray 2 Flash",
    modelId: "ray-flash-2",
  },
  {
    name: "Ray 2",
    modelId: "ray-2",
  },
] as const;

export const lumaVideoModels: VideoModel[] = lumaVideoModelsData.map(
  (model) => ({
    ...model,
    provider: "luma",
  }),
);
