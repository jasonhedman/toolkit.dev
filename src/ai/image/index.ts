import { openAiImageModels } from "./models/openai";
import { xaiImageModels } from "./models/xai";
import { fireworksImageModels } from "./models/fireworks";
import { falImageModels } from "./models/fal";
import { lumaImageModels } from "./models/luma";

export const allImageModels = [
  ...openAiImageModels,
  ...xaiImageModels,
  ...falImageModels,
  ...fireworksImageModels,
  ...lumaImageModels,
];
