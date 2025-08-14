import type { LanguageModel } from "@/ai/language/types";

const qwenModelData: Omit<LanguageModel, "provider">[] = [
  {
    name: "Qwen QwQ 32B",
    modelId: "qwq-32b",
    description:
      "Qwen QWQ 32B is a large language model optimized for various natural language processing tasks",
    capabilities: [],
    bestFor: ["General purpose", "Text generation", "Conversation"],
    contextLength: 131072,
  },
  {
    name: "Qwen 3 32B",
    modelId: "qwen3-32b",
    description:
      "Qwen 3 32B is the latest generation of Qwen models with enhanced capabilities",
    capabilities: [],
    bestFor: ["Advanced reasoning", "Code generation", "Creative writing"],
    contextLength: 131072,
  },
];

export const qwenModels: LanguageModel[] = qwenModelData.map((model) => ({
  ...model,
  provider: "qwen",
}));
