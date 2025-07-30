"use client";

import { X, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModelProviderIcon } from "@/components/ui/model-icon";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
import { useIsMobile } from "@/hooks/use-mobile";
import type { LanguageModel } from "@/ai/types";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Shared content component for both dropdown and drawer
const ModelSelectContent: React.FC<{
  models: ReturnType<typeof useModelSelect>["models"];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCapabilities: LanguageModelCapability[];
  selectedProviders: string[];
  toggleCapability: (capability: LanguageModelCapability) => void;
  toggleProvider: (provider: string) => void;
  handleModelSelect: (model: LanguageModel) => void;
  selectedChatModel: LanguageModel | undefined;
  availableProviders: string[];
  isMobile?: boolean;
}> = ({
  models,
  searchQuery,
  setSearchQuery,
  selectedCapabilities,
  selectedProviders,
  toggleCapability,
  toggleProvider,
  handleModelSelect,
  selectedChatModel,
  availableProviders,
  isMobile = false,
}) => (
  <Command>
    <div
      className={cn(
        "bg-background border-b p-4",
        !isMobile && "sticky top-0 z-10 p-2",
      )}
    >
      <h2 className={cn("mb-2 font-bold", isMobile ? "text-lg" : "text-sm")}>
        Model Selector
      </h2>
      <div className="relative mb-2">
        <CommandInput
          placeholder="Search models..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
      </div>
      <div className="space-y-2">
        <div>
          <div className="text-muted-foreground mb-1.5 text-xs font-medium">
            Providers
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {availableProviders.map((provider) => (
              <Badge
                key={provider}
                variant={
                  selectedProviders.includes(provider) ? "default" : "outline"
                }
                className="shrink-0 cursor-pointer gap-1 px-1.5 py-0.5"
                onClick={() => toggleProvider(provider)}
              >
                <ModelProviderIcon provider={provider} className="size-3" />
                {modelProviderNames[provider]}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1.5 text-xs font-medium">
            Capabilities
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
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
                  className="shrink-0 cursor-pointer gap-1 px-1.5 py-0.5"
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
    <CommandList
      className={cn(
        "w-full max-w-full overflow-x-hidden overflow-y-auto px-1",
        isMobile ? "max-h-[50vh] pb-4" : "max-h-32 md:max-h-48",
      )}
    >
      <CommandEmpty>No models found.</CommandEmpty>
      <CommandGroup>
        {models?.map((model) => (
          <CommandItem
            key={model.modelId}
            value={`${model.name} ${model.provider}`}
            onSelect={() => handleModelSelect(model)}
            className={cn(
              "flex w-full max-w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors",
              selectedChatModel?.modelId === model.modelId && "bg-accent",
              isMobile && "min-h-[44px]",
            )}
          >
            <div className="flex max-w-full min-w-0 flex-1 flex-shrink-0 items-center gap-2 overflow-hidden">
              <ModelProviderIcon
                provider={model.provider}
                className="size-4 flex-shrink-0"
              />
              <span className="truncate text-sm font-medium">{model.name}</span>
              {model.isNew && (
                <Badge variant="secondary" className="h-5 text-xs">
                  New
                </Badge>
              )}
            </div>
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
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  </Command>
);

export const ModelSelect: React.FC = () => {
  const { selectedChatModel, setSelectedChatModel } = useChatContext();
  const isMobile = useIsMobile();

  const {
    models,
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

  // Check if native search toggle will be shown
  const hasNativeSearch = selectedChatModel?.capabilities?.includes(
    LanguageModelCapability.WebSearch,
  );

  const triggerButton = (
    <Button
      variant="outline"
      className={cn(
        "justify-center bg-transparent md:w-auto md:justify-start",
        // Use wider button on mobile when both icons are present
        hasNativeSearch && selectedChatModel ? "h-9 w-16" : "size-9",
      )}
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
      {selectedChatModel ? (
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
  );

  const contentProps = {
    models,
    searchQuery,
    setSearchQuery,
    selectedCapabilities,
    selectedProviders,
    toggleCapability,
    toggleProvider,
    handleModelSelect,
    selectedChatModel,
    availableProviders,
  };

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="sr-only">
              <DrawerTitle>Model Selector</DrawerTitle>
            </DrawerHeader>
            <ModelSelectContent {...contentProps} isMobile={true} />
          </DrawerContent>
        </Drawer>
      ) : (
        <DropdownMenu
          open={isOpen}
          onOpenChange={isOpen ? setIsOpen : undefined}
        >
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-xs overflow-hidden p-0 md:w-lg"
            align="start"
            sideOffset={8}
          >
            <ModelSelectContent {...contentProps} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};
