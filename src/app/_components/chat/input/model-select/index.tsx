"use client";

import { X, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModelProviderIcon } from "@/components/ui/model-icon";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  capabilityColors,
  capabilityIcons,
  capabilityLabels,
  modelProviderNames,
} from "./utils";
import { LanguageModelCapability } from "@/ai/types";

import { useModelSelect } from "./use-model-select";

import { useChatContext } from "@/app/_contexts/chat-context";
import { cn } from "@/lib/utils";
import { NativeSearchToggle } from "./native-search-toggle";

export const ModelSelect: React.FC = () => {
  const { selectedChatModel, setSelectedChatModel } = useChatContext();

  const {
    models,
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
  } = useModelSelect({ selectedChatModel, setSelectedChatModel });

  // Get unique providers from models
  const availableProviders = Array.from(
    new Set((models ?? []).map((model) => model.provider)),
  );

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={isOpen ? setIsOpen : undefined}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-fit justify-start bg-transparent md:w-auto"
            disabled={isLoading && !selectedChatModel}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              const isNativeSearchToggle = target.closest(
                '[data-native-search-toggle="true"]',
              );
              if (!isNativeSearchToggle) {
                setIsOpen(!isOpen);
              }
            }}
          >
            {isLoading && !selectedChatModel ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="hidden flex-1 truncate text-left md:block">
                  Loading Models
                </span>
              </>
            ) : selectedChatModel ? (
              <>
                <ModelProviderIcon
                  provider={selectedChatModel.provider}
                  className="size-4"
                />
                <span className="hidden flex-1 truncate text-left md:block">
                  {selectedChatModel.name}
                </span>
                <NativeSearchToggle />
              </>
            ) : (
              <>
                <X className="mr-2 size-4" />
                Select a model
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-xs overflow-hidden p-0 md:w-lg"
          align="start"
          sideOffset={8}
        >
          <div className="bg-background sticky top-0 z-10 border-b p-2">
            <h2 className="mb-2 text-sm font-bold">Model Selector</h2>
            <div className="relative mb-2">
              <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-muted-foreground mb-1.5 text-xs font-medium">
                  Providers
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableProviders.map((provider) => (
                    <Badge
                      key={provider}
                      variant={
                        selectedProviders.includes(provider)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer gap-1 px-1.5 py-0.5"
                      onClick={() => toggleProvider(provider)}
                    >
                      <ModelProviderIcon
                        provider={provider}
                        className="size-3"
                      />
                      {modelProviderNames[provider]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1.5 text-xs font-medium">
                  Capabilities
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.values(LanguageModelCapability).map((capability) => {
                    const Icon = capabilityIcons[capability];
                    return (
                      <Badge
                        key={capability}
                        variant={
                          selectedCapabilities.includes(capability)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer gap-1 px-1.5 py-0.5"
                        onClick={() => toggleCapability(capability)}
                      >
                        {Icon && <Icon className="size-3" />}
                        {capabilityLabels[capability]}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="max-h-32 w-full max-w-full overflow-x-hidden overflow-y-auto md:max-h-48">
            {models?.map((model) => (
              <DropdownMenuItem
                key={model.modelId}
                className={cn(
                  "hover:bg-accent/50 flex w-full max-w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors",
                  selectedChatModel?.modelId === model.modelId && "bg-accent",
                )}
                onClick={() => handleModelSelect(model)}
              >
                {/* Name, provider, new badge stack */}
                <div className="flex max-w-full min-w-0 flex-1 flex-shrink-0 items-center gap-2 overflow-hidden">
                  <ModelProviderIcon
                    provider={model.provider}
                    className="size-4 flex-shrink-0"
                  />
                  <span className="truncate text-sm font-medium">
                    {model.name}
                  </span>
                  {model.isNew && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      New
                    </Badge>
                  )}
                </div>
                {/* Capabilities justified to the right */}
                <div className="flex flex-1 justify-end gap-1">
                  {model.capabilities?.map((capability) => {
                    const Icon = capabilityIcons[capability];
                    return (
                      <Badge
                        key={capability}
                        variant="capability"
                        className={`h-5 gap-1 px-1 text-xs ${capabilityColors[capability]}`}
                      >
                        {Icon && <Icon className="size-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
