"use client";

import { Eye, Search, Sparkles, File, Wrench } from "lucide-react";
import {
  SiGoogle,
  SiOpenai,
  SiAnthropic,
  SiPerplexity,
  SiX,
} from "@icons-pack/react-simple-icons";

import { LanguageModelCapability, type Provider } from "@/ai/types";

export const capabilityIcons: Record<
  LanguageModelCapability,
  React.ComponentType<{ className?: string }>
> = {
  [LanguageModelCapability.Vision]: Eye,
  [LanguageModelCapability.WebSearch]: Search,
  [LanguageModelCapability.Reasoning]: Sparkles,
  [LanguageModelCapability.Pdf]: File,
  [LanguageModelCapability.ToolCalling]: Wrench,
};

export const capabilityLabels: Record<LanguageModelCapability, string> = {
  [LanguageModelCapability.Vision]: "Vision",
  [LanguageModelCapability.WebSearch]: "Web Search",
  [LanguageModelCapability.Reasoning]: "Reasoning",
  [LanguageModelCapability.Pdf]: "PDF",
  [LanguageModelCapability.ToolCalling]: "Tool Calling",
};

export const capabilityColors: Record<LanguageModelCapability, string> = {
  [LanguageModelCapability.Vision]: "bg-green-100 text-green-800",
  [LanguageModelCapability.WebSearch]: "bg-yellow-100 text-yellow-800",
  [LanguageModelCapability.Reasoning]: "bg-orange-100 text-orange-800",
  [LanguageModelCapability.Pdf]: "bg-gray-200 text-gray-800",
  [LanguageModelCapability.ToolCalling]: "bg-blue-100 text-blue-800",
};

export const formatContextLength = (length?: number) => {
  if (!length) return null;
  if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M tokens`;
  if (length >= 1000) return `${(length / 1000).toFixed(0)}K tokens`;
  return `${length} tokens`;
};

export const modelProviderNames: Record<Provider, string> = {
  openai: "OpenAI",
  google: "Google",
  anthropic: "Anthropic",
  perplexity: "Perplexity",
  xai: "xAI",
};

export const modelIcons: Record<
  Provider,
  React.ComponentType<{ className?: string }>
> = {
  openai: SiOpenai,
  google: SiGoogle,
  anthropic: SiAnthropic,
  perplexity: SiPerplexity,
  xai: SiX,
};
