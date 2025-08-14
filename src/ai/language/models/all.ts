import { openAiLanguageModels } from "./openai";
import { xaiLanguageModels } from "./xai";
import { perplexityModels } from "./perplexity";
import { googleModels } from "./google";
import { anthropicModels } from "./anthropic";
import { llamaModels } from "./llama";
import { qwenModels } from "./qwen";
import { deepseekModels } from "./deepseek";
import { openRouterModels } from "./openrouter";

export const allLanguageModels = [
  ...openRouterModels, // Add at the top to give it priority
  ...anthropicModels,
  ...googleModels,
  ...openAiLanguageModels,
  ...xaiLanguageModels,
  ...perplexityModels,
  ...llamaModels,
  ...qwenModels,
  ...deepseekModels,
];
