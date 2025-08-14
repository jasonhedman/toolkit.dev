import React, { memo } from "react";

import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/stack";

import { Handle } from "../../lib/handle";

interface Props {
  Icon: React.FC<{ className?: string }>;
  label: string;
  amount: number;
  handleRef: React.RefObject<HTMLDivElement | null>;
  comingSoon?: boolean;
}

export const SourceNode: React.FC<Props> = memo(
  ({ Icon, label, amount, comingSoon, handleRef }) => {
    return (
      <Card className="relative w-full justify-center gap-0 p-2 md:gap-1">
        <HStack className="gap-1 md:gap-2">
          <Icon className="size-2.5 md:size-4" />
          <span className="text-xs font-semibold md:text-base">{label}</span>
        </HStack>
        {comingSoon ? (
          <span className="text-primary/60 text-[10px] font-bold md:text-sm">
            Coming Soon
          </span>
        ) : (
          <span className="text-primary text-[10px] font-bold md:text-sm">
            {amount.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            })}
          </span>
        )}
        <Handle side="right" ref={handleRef} />
      </Card>
    );
  },
);

SourceNode.displayName = "SourceNode";
