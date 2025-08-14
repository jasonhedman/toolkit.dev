import {
  openAiLanguageModels,
  xaiLanguageModels,
  perplexityModels,
  googleModels,
  anthropicModels,
  llamaModels,
  qwenModels,
  deepseekModels,
  openRouterModels,
} from "./models";

export const languageModels = [
  ...anthropicModels,
  ...googleModels,
  ...openAiLanguageModels,
  ...xaiLanguageModels,
  ...perplexityModels,
  ...openRouterModels,
  ...llamaModels,
  ...qwenModels,
  ...deepseekModels,
];
