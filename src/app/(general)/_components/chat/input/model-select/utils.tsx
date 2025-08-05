"use client";

import { Eye, Sparkles, File, Wrench, Globe, Gift } from "lucide-react";

import { LanguageModelCapability } from "@/ai/language/types";

export const capabilityIcons: Record<
  LanguageModelCapability,
  React.ComponentType<{ className?: string }>
> = {
  [LanguageModelCapability.Vision]: Eye,
  [LanguageModelCapability.WebSearch]: Globe,
  [LanguageModelCapability.Reasoning]: Sparkles,
  [LanguageModelCapability.Pdf]: File,
  [LanguageModelCapability.ToolCalling]: Wrench,
  [LanguageModelCapability.Free]: Gift,
};

export const capabilityLabels: Record<LanguageModelCapability, string> = {
  [LanguageModelCapability.Vision]: "Vision",
  [LanguageModelCapability.WebSearch]: "Web Search",
  [LanguageModelCapability.Reasoning]: "Reasoning",
  [LanguageModelCapability.Pdf]: "PDF",
  [LanguageModelCapability.ToolCalling]: "Tool Calling",
  [LanguageModelCapability.Free]: "Free",
};

export const capabilityColors: Record<LanguageModelCapability, string> = {
  [LanguageModelCapability.Vision]: "bg-green-100 text-green-800",
  [LanguageModelCapability.WebSearch]: "bg-blue-100 text-blue-500",
  [LanguageModelCapability.Reasoning]: "bg-orange-100 text-orange-800",
  [LanguageModelCapability.Pdf]: "bg-gray-200 text-gray-800",
  [LanguageModelCapability.ToolCalling]: "bg-yellow-100 text-yellow-800",
  [LanguageModelCapability.Free]: "bg-purple-100 text-purple-800",
};

export const formatContextLength = (length?: number) => {
  if (!length) return null;
  if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M tokens`;
  if (length >= 1000) return `${(length / 1000).toFixed(0)}K tokens`;
  return `${length} tokens`;
};

export const modelProviderNames: Record<string, string> = {
  openai: "OpenAI",
  google: "Google",
  anthropic: "Anthropic",
  perplexity: "Perplexity",
  "x-ai": "xAI",
  "meta-llama": "Llama",
  qwen: "Qwen",
  deepseek: "DeepSeek",
  fireworks: "Fireworks AI",
  azure: "Azure (DALL-E)",
  vertex: "Google Vertex AI",
  xai: "xAI",
  openrouter: "OpenRouter",
};
