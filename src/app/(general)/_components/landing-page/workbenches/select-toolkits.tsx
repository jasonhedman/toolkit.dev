"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VStack } from "@/components/ui/stack";

import { ToolkitIcon } from "@/components/toolkit/toolkit-icons";

import { clientToolkits } from "@/toolkits/toolkits/client";

import type { Toolkits } from "@/toolkits/toolkits/shared";

export const SelectToolkits: React.FC = () => {
  const [selectedToolkits, setSelectedToolkits] = useState<Toolkits[]>([]);

  return (
    <VStack className="w-full items-start gap-2">
      <Label className="text-base font-semibold">Toolkits</Label>
      <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
        {Object.entries(clientToolkits).map(([id, toolkit]) => {
          const isSelected = selectedToolkits.includes(id as Toolkits);

          return (
            <Button
              key={id}
              variant={isSelected ? "primaryOutline" : "outline"}
              className="justify-start gap-2"
              onClick={() =>
                setSelectedToolkits((prev) =>
                  isSelected
                    ? prev.filter((t) => t !== (id as Toolkits))
                    : [...prev, id as Toolkits],
                )
              }
            >
              <ToolkitIcon
                toolkit={id as Toolkits}
                className="size-4 md:size-4"
              />
              <span className="text-xs">{toolkit.name}</span>
            </Button>
          );
        })}
      </div>
    </VStack>
  );
};
