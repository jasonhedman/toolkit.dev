import React, { memo } from "react";

import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/stack";

import { Handle } from "../../lib/handle";

interface Props {
  Icon: React.FC<{ className?: string }>;
  label: string;
  amount: number;
  numPrs: number;
  handleRef: React.RefObject<HTMLDivElement | null>;
}

export const TargetNode = memo(
  ({ Icon, label, amount, numPrs, handleRef }: Props) => {
    return (
      <Card className="relative size-full gap-0 p-2 md:gap-1">
        <Handle side="left" ref={handleRef} />
        <HStack className="gap-1 md:gap-2">
          <Icon className="size-2.5 md:size-4" />
          <span className="text-xs font-semibold md:text-base">{label}</span>
        </HStack>
        <HStack className="text-primary justify-between text-[10px] md:text-sm">
          <span className="text-primary font-bold">
            {amount.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            })}
          </span>
          <span className="text-foreground/80 font-light md:text-xs">
            {numPrs} PRs
          </span>
        </HStack>
      </Card>
    );
  },
);

TargetNode.displayName = "TargetNode";
