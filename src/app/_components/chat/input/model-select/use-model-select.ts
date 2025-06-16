"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type {
  LanguageModel,
  LanguageModelCapability,
  Provider,
} from "@/ai/types";

interface UseModelSelectProps {
  selectedChatModel: LanguageModel | undefined;
  setSelectedChatModel: (model: LanguageModel) => void;
}

export const useModelSelect = ({
  setSelectedChatModel,
}: UseModelSelectProps) => {
  const { data: models, isLoading } = api.models.getLanguageModels.useQuery(
    undefined,
    {
      staleTime: Infinity,
      select: (data) => {
        const providers = Array.from(
          new Set(data.map((model) => model.provider)),
        );
        const modelsByProvider = providers.reduce(
          (acc, provider) => {
            acc[provider] = data.filter((model) => model.provider === provider);
            return acc;
          },
          {} as Record<string, typeof data>,
        );

        const result: typeof data = [];
        let index = 0;
        while (result.length < data.length) {
          for (const provider of providers) {
            const providerModels = modelsByProvider[provider];
            const model = providerModels?.[index];
            if (model) {
              result.push(model);
            }
          }
          index++;
        }
        return result;
      },
    },
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCapabilities, setSelectedCapabilities] = useState<
    LanguageModelCapability[]
  >([]);
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);

  const handleModelSelect = (model: LanguageModel) => {
    setSelectedChatModel(model);
    setIsOpen(false);
  };

  const filteredModels = models?.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCapabilities =
      selectedCapabilities.length === 0 ||
      selectedCapabilities.every((capability) =>
        model.capabilities?.includes(capability),
      );

    const matchesProviders =
      selectedProviders.length === 0 ||
      selectedProviders.includes(model.provider);

    return matchesSearch && matchesCapabilities && matchesProviders;
  });

  const toggleCapability = (capability: LanguageModelCapability) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capability)
        ? prev.filter((c) => c !== capability)
        : [...prev, capability],
    );
  };

  const toggleProvider = (provider: Provider) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider],
    );
  };

  return {
    models: filteredModels,
    isLoading,
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    selectedCapabilities,
    selectedProviders,
    toggleCapability,
    toggleProvider,
    handleModelSelect,
  };
};
