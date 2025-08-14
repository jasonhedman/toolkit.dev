import {
  LanguageModelCapability,
  type LanguageModel,
} from "@/ai/language/types";

const openRouterModelData: Omit<LanguageModel, "provider">[] = [
  {
    name: "Horizon Beta",
    modelId: "horizon-beta",
    description:
      "A cloaked model provided to the community to gather feedback. Supports vision and long-context tasks.",
    capabilities: [
      LanguageModelCapability.Vision,
      LanguageModelCapability.ToolCalling,
      LanguageModelCapability.Pdf,
      LanguageModelCapability.Free,
    ],
    bestFor: [
      "Image analysis",
      "Long-context tasks",
      "Community feedback",
      "General purpose AI",
    ],
    contextLength: 256000,
    isNew: true,
  },
  {
    name: "Auto",
    modelId: "auto",
    description:
      "Automatically selects the best model for your task using NotDiamond, with access to all model capabilities",
    capabilities: [
      LanguageModelCapability.Vision,
      LanguageModelCapability.ToolCalling,
    ],
    bestFor: [
      "Automatic model selection",
      "Optimal performance",
      "Dynamic routing",
      "Multi-capability tasks",
    ],
    contextLength: 200000, // Using a high value since it can route to models with large context
    isNew: true,
  },
];

export const openRouterModels: LanguageModel[] = openRouterModelData.map(
  (model) => ({
    ...model,
    provider: "openrouter", // This matches the icon filename in public/icons/openrouter.png
  }),
);
