import React from "react";

import { Anvil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HStack, VStack } from "@/components/ui/stack";
import { Textarea } from "@/components/ui/textarea";

import { SelectToolkits } from "./select-toolkits";

export const WorkbenchForm: React.FC = () => {
  return (
    <Card className="mx-auto w-full max-w-2xl flex-col justify-center gap-4 p-4">
      <HStack>
        <Anvil />
        <h1 className="text-xl font-bold">New Workbench</h1>
      </HStack>
      <VStack className="w-full items-start gap-2">
        <Label htmlFor="name" className="text-base font-semibold">
          Name
        </Label>
        <Input id="name" placeholder="Ex: Research Assistant" maxLength={100} />
      </VStack>

      {/* System Prompt Field */}
      <VStack className="w-full items-start gap-2">
        <Label htmlFor="systemPrompt" className="text-base font-semibold">
          System Prompt
        </Label>
        <Textarea
          id="systemPrompt"
          placeholder="Ex: You are a research assistant that helps users gather, analyze, and document information from multiple sources."
          rows={8}
          className="resize-none"
          maxLength={10000}
        />
      </VStack>
      <SelectToolkits />
    </Card>
  );
};
