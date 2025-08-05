"use client";

import { useRef } from "react";

import {
  Trophy,
  CircleDollarSign,
  Wrench,
  Server,
  Paintbrush,
} from "lucide-react";

import { HStack, VStack } from "@/components/ui/stack";
import { SourceNode } from "./source-node";
import { ToolkitNode } from "./toolkit-node";
import { TargetNode } from "./target-node";
import { MeritLogo } from "@/components/ui/merit-logo";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

export const Graphic = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const source1 = useRef<HTMLDivElement>(null);
  const source2 = useRef<HTMLDivElement>(null);
  const source3 = useRef<HTMLDivElement>(null);
  const toolkitTarget = useRef<HTMLDivElement>(null);
  const toolkitSource = useRef<HTMLDivElement>(null);
  const target1 = useRef<HTMLDivElement>(null);
  const target2 = useRef<HTMLDivElement>(null);
  const target3 = useRef<HTMLDivElement>(null);

  return (
    <HStack
      ref={containerRef}
      className="relative w-full gap-5 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16"
    >
      <VStack className="flex-1 gap-1 md:gap-2">
        <SourceNode
          Icon={MeritLogo}
          label="Merit Funding"
          amount={6000}
          comingSoon={false}
          handleRef={source1}
        />
        <SourceNode
          Icon={Trophy}
          label="Hackathon Prize"
          amount={2000}
          comingSoon={false}
          handleRef={source2}
        />
        <SourceNode
          Icon={CircleDollarSign}
          label="Revenue"
          amount={1000}
          comingSoon={true}
          handleRef={source3}
        />
      </VStack>
      <ToolkitNode targetRef={toolkitTarget} sourceRef={toolkitSource} />
      <VStack className="flex-1 gap-1 md:gap-2">
        <TargetNode
          Icon={Wrench}
          label="Tool Developer"
          amount={1875.89}
          numPrs={15}
          handleRef={target1}
        />
        <TargetNode
          Icon={Server}
          label="API Engineer"
          amount={1659.74}
          numPrs={13}
          handleRef={target2}
        />
        <TargetNode
          Icon={Paintbrush}
          label="UI/UX Designer"
          amount={1207.99}
          numPrs={7}
          handleRef={target3}
        />
      </VStack>
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={toolkitTarget}
        toRef={source1}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={toolkitTarget}
        toRef={source2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={toolkitTarget}
        toRef={source3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={toolkitSource}
        toRef={target1}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={toolkitSource}
        toRef={target2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={toolkitSource}
        toRef={target3}
      />
    </HStack>
  );
};
