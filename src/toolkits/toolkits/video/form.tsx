"use client";

import React, { useState } from "react";

import type { z, ZodObject } from "zod";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { HStack } from "@/components/ui/stack";
import { ModelProviderIcon } from "@/components/ui/model-icon";

import { EnvVarDialog } from "@/components/env-vars/env-var-dialog";

import { allVideoModels } from "@/ai/video";

import { useEnvVarAvailable } from "@/contexts/env/available-env-vars";

import { videoEnvVarMap } from "./env-vars";

import { cn } from "@/lib/utils";
import { IS_DEVELOPMENT } from "@/lib/constants";

import type { videoParameters } from "./base";
import type { VideoModel } from "@/ai/video/types";
import { videoKeyMap } from "@/ai/video/key-map";

const imageModelHeight = 48;

export const VideoForm: React.ComponentType<{
  parameters: z.infer<ZodObject<typeof videoParameters.shape>>;
  setParameters: (
    parameters: z.infer<ZodObject<typeof videoParameters.shape>>,
  ) => void;
}> = ({ parameters, setParameters }) => {
  return (
    <Command className="bg-transparent">
      <CommandInput placeholder="Search models..." />
      <CommandList
        style={{ maxHeight: `${imageModelHeight * 4.5}px` }}
        gradientClassName="from-background"
      >
        <CommandEmpty>No models found.</CommandEmpty>
        <CommandGroup className="p-0">
          {allVideoModels.map((model) => {
            const modelValue = `${model.provider}:${model.modelId}`;
            const isSelected = parameters.model === modelValue;

            return !IS_DEVELOPMENT ? (
              <VideoModelItem
                key={model.modelId}
                model={model}
                isSelected={isSelected}
                onSelect={() => {
                  setParameters({
                    model: modelValue as typeof parameters.model,
                  });
                }}
              />
            ) : (
              <DevVideoModelItem
                key={model.modelId}
                model={model}
                isSelected={isSelected}
                onSelect={() => {
                  setParameters({
                    model: modelValue as typeof parameters.model,
                  });
                }}
              />
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

interface ImageModelItemProps {
  model: VideoModel;
  isSelected: boolean;
  onSelect: () => void;
}

const VideoModelItem = ({
  model,
  isSelected,
  onSelect,
}: ImageModelItemProps) => {
  return (
    <CommandItem
      key={model.modelId}
      value={`${model.name} ${model.modelId} ${model.provider}`}
      onSelect={onSelect}
      className={cn(
        "data-[selected=true]:bg-primary/10 cursor-pointer rounded-none transition-colors",
        isSelected && "bg-primary/20 data-[selected=true]:bg-primary/20",
      )}
      style={{ height: `${imageModelHeight}px` }}
    >
      <HStack className="flex-1">
        <ModelProviderIcon provider={model.provider} />
        <div className="flex flex-col">
          <p className={cn("text-sm", isSelected && "text-primary")}>
            {model.name}
          </p>
          <p className="text-xs opacity-60">{model.modelId}</p>
        </div>
      </HStack>
    </CommandItem>
  );
};

const DevVideoModelItem = ({
  model,
  isSelected,
  onSelect,
}: ImageModelItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasEnvVar = useEnvVarAvailable(videoKeyMap[model.provider]);

  const envVar = videoEnvVarMap[model.provider];

  return (
    <>
      <VideoModelItem
        model={model}
        isSelected={isSelected}
        onSelect={!hasEnvVar ? () => setIsOpen(true) : onSelect}
      />
      <EnvVarDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        resourceName={`the ${model.name} model`}
        envVars={[
          {
            type: "all",
            keys: [envVar.key],
            description: envVar.description,
          },
        ]}
        onSuccess={onSelect}
      />
    </>
  );
};
