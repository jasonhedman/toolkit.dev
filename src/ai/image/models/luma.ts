import type { ImageModel } from "../types";

const lumaImageModelsData: Omit<ImageModel, "provider">[] = [
  {
    name: "Photon 1",
    modelId: "photon-1",
  },
  {
    name: "Photon 1 Flash",
    modelId: "photon-flash-1",
  },
];

export const lumaImageModels: ImageModel[] = lumaImageModelsData.map(
  (model) => ({
    ...model,
    provider: "luma",
  }),
);
