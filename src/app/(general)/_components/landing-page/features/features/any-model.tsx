"use client";

import React, { useRef } from "react";

import { Plus } from "lucide-react";
import { SiAnthropic, SiOpenai, SiX } from "@icons-pack/react-simple-icons";

import { Logo } from "@/components/ui/logo";
import { HStack, VStack } from "@/components/ui/stack";

import { AnimatedBeam, Circle } from "@/components/magicui/animated-beam";

const iconProps = {
  className: "size-4",
};

export const AnyModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const target1Ref = useRef<HTMLDivElement>(null);
  const target2Ref = useRef<HTMLDivElement>(null);
  const target3Ref = useRef<HTMLDivElement>(null);
  const target4Ref = useRef<HTMLDivElement>(null);

  return (
    <VStack ref={containerRef} className="relative w-full gap-8">
      <Circle ref={sourceRef} className="p-4">
        <Logo className="size-8" />
      </Circle>
      <HStack className="w-full justify-between">
        <Circle ref={target1Ref}>
          <SiOpenai {...iconProps} />
        </Circle>
        <Circle ref={target2Ref}>
          <SiAnthropic {...iconProps} />
        </Circle>
        <Circle ref={target3Ref}>
          <SiX {...iconProps} />
        </Circle>
        <Circle ref={target4Ref}>
          <Plus {...iconProps} />
        </Circle>
      </HStack>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target1Ref}
        duration={6}
        isVertical
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target2Ref}
        duration={6}
        isVertical
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target3Ref}
        duration={6}
        isVertical
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target4Ref}
        duration={6}
        isVertical
      />
    </VStack>
  );
};
