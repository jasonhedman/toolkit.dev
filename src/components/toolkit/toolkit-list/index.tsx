import React, { useEffect, useMemo, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";

import { ToolkitItem } from "./item";

import { clientToolkits } from "@/toolkits/toolkits/client";
import { api } from "@/trpc/react";

import type { ClientToolkit } from "@/toolkits/types";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { SelectedToolkit } from "../types";

interface ToolkitListProps {
  selectedToolkits: SelectedToolkit[];
  onAddToolkit: (toolkit: SelectedToolkit) => void;
  onRemoveToolkit: (id: Toolkits) => void;
  gradientClassName?: string;
}

const toolkitItemHeight = 48;
const numToolkitsToShow = 5;

export const ToolkitList: React.FC<ToolkitListProps> = ({
  selectedToolkits,
  onAddToolkit,
  onRemoveToolkit,
  gradientClassName,
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const { data: toolkitUsage = [] } = api.tools.getTopToolkits.useQuery({
    limit: 100,
  });
  const toolkitUsageById = useMemo(() => {
    return new Map(
      toolkitUsage
        .filter((toolkit) => toolkit.id)
        .map((toolkit) => [toolkit.id as Toolkits, toolkit.totalUsage]),
    );
  }, [toolkitUsage]);

  useEffect(() => {
    const updatedToolkits = Object.entries(clientToolkits).filter(([id]) => {
      return (
        searchParams.get(id) === "true" &&
        !selectedToolkits.some((t) => t.id === (id as Toolkits))
      );
    });

    if (updatedToolkits.length > 0) {
      updatedToolkits.forEach(([id, toolkit]) => {
        onAddToolkit({
          id: id as Toolkits,
          parameters: {},
          toolkit: toolkit as ClientToolkit,
        });
      });
      window.history.replaceState({}, "", pathname);
    }
  }, [searchParams, onAddToolkit, selectedToolkits, router, pathname]);

  return (
    <Command className="bg-transparent">
      <CommandInput
        placeholder="Search toolkits..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList
        style={{
          height: `${toolkitItemHeight * (numToolkitsToShow + 0.5)}px`,
        }}
        gradientClassName={gradientClassName}
      >
        <CommandEmpty>No toolkits match your search</CommandEmpty>
        {selectedToolkits.length > 0 && (
          <CommandGroup className="p-0" heading="Enabled">
            {selectedToolkits.map((toolkit) => (
              <ToolkitItem
                key={toolkit.id}
                id={toolkit.id}
                toolkit={toolkit.toolkit}
                isSelected={true}
                addToolkit={onAddToolkit}
                removeToolkit={onRemoveToolkit}
                usageCount={toolkitUsageById.get(toolkit.id) ?? 0}
              />
            ))}
          </CommandGroup>
        )}
        {Object.keys(clientToolkits).length > selectedToolkits.length && (
          <CommandGroup className="p-0">
            {Object.entries(clientToolkits)
              .filter(
                ([id]) =>
                  !selectedToolkits.some((t) => t.id === (id as Toolkits)),
              )
              .map(([id, toolkit]) => {
                const typedId = id as Toolkits;
                return (
                  <ToolkitItem
                    key={typedId}
                    id={typedId}
                    toolkit={toolkit as ClientToolkit}
                    isSelected={selectedToolkits.some((t) => t.id === typedId)}
                    addToolkit={onAddToolkit}
                    removeToolkit={onRemoveToolkit}
                    usageCount={toolkitUsageById.get(typedId) ?? 0}
                  />
                );
              })}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};
