"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toolkits } from "@/toolkits/toolkits/shared";
import { localStorageUtils } from "@/lib/local-storage";
import { ToolkitList } from "@/components/toolkit/toolkit-list";
import type { SelectedToolkit } from "@/components/toolkit/types";
import { HStack, VStack } from "@/components/ui/stack";
import { Logo } from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";
import { getClientToolkit } from "@/toolkits/toolkits/client";
import type { ClientToolkit } from "@/toolkits/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedToolkits, setSelectedToolkits] = useState<SelectedToolkit[]>([
    {
      id: Toolkits.Image,
      toolkit: getClientToolkit(Toolkits.Image) as ClientToolkit,
      parameters: {
        model: "xai:grok-image-2",
      },
    },
    {
      id: Toolkits.Exa,
      toolkit: getClientToolkit(Toolkits.Exa) as ClientToolkit,
      parameters: {},
    },
    {
      id: Toolkits.E2B,
      toolkit: getClientToolkit(Toolkits.E2B) as ClientToolkit,
      parameters: {},
    },
    {
      id: Toolkits.Memory,
      toolkit: getClientToolkit(Toolkits.Memory) as ClientToolkit,
      parameters: {},
    },
  ]);

  const addToolkit = ({ id, toolkit, parameters }: SelectedToolkit) => {
    setSelectedToolkits((prev) => [
      ...prev.filter((t) => t.id !== id),
      { id, toolkit, parameters },
    ]);
  };

  const removeToolkit = (id: Toolkits) => {
    setSelectedToolkits((prev) => prev.filter((t) => t.id !== id));
  };

  const handleContinueToChat = () => {
    // Save selected toolkits to local storage
    localStorageUtils.setToolkits(selectedToolkits);

    // Redirect to the main chat page
    router.push("/");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <VStack className="max-w-2xl gap-4">
        <VStack className="gap-4">
          <Logo className="size-16" />
          <VStack className="gap-1">
            <h1 className="text-primary text-2xl font-bold">
              Let&apos;s Get Started
            </h1>
            <p className="text-muted-foreground text-sm">
              Toolkits enhance your chat experience with specialized tools.
            </p>
          </VStack>
        </VStack>
        <Card className="flex w-full max-w-2xl flex-col items-center gap-4 p-4">
          <HStack className="w-full justify-between">
            <h2 className="text-center text-xl font-bold">
              Select your Toolkits
            </h2>
            <Button onClick={handleContinueToChat} size="lg">
              Continue to Chat <ArrowRight className="size-4" />
            </Button>
          </HStack>

          <ToolkitList
            selectedToolkits={selectedToolkits}
            onAddToolkit={addToolkit}
            onRemoveToolkit={removeToolkit}
          />
        </Card>
        <p className="text-muted-foreground text-center text-sm">
          Toolkits are collections of specialized tools that extend the
          AI&apos;s capabilities. You can add web search, code execution, image
          generation, and more to customize your experience.
        </p>
      </VStack>
    </div>
  );
}
