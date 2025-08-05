import React, { memo } from "react";

import { Card } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/logo";

import { Handle } from "../../lib/handle";

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
  sourceRef: React.RefObject<HTMLDivElement | null>;
}

export const ToolkitNode: React.FC<Props> = memo(({ targetRef, sourceRef }) => {
  return (
    <Card className="relative size-16 shrink-0 p-2 sm:size-28 md:size-32 md:p-4 lg:size-36 xl:size-40">
      <Handle side="left" ref={targetRef} />
      <AnimatedLogo className="size-full" />
      <Handle side="right" ref={sourceRef} />
    </Card>
  );
});

ToolkitNode.displayName = "ToolkitNode";
