"use client";

import React, { useRef } from "react";

import Link from "next/link";

import { SiGithub } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack, VStack } from "@/components/ui/stack";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { Logo } from "@/components/ui/logo";

import { Section } from "../lib/section";
import { Heading } from "../lib/heading";

import { SECTIONS } from "../sections";
import { Handle } from "../lib/handle";

import { cn } from "@/lib/utils";

export const MeritSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const meritLeftRef = useRef<HTMLDivElement>(null);
  const meritRightRef = useRef<HTMLDivElement>(null);
  const pr1Ref = useRef<HTMLDivElement>(null);
  const pr2Ref = useRef<HTMLDivElement>(null);
  const pr3Ref = useRef<HTMLDivElement>(null);
  const pr4Ref = useRef<HTMLDivElement>(null);

  return (
    <Section id={SECTIONS.Merit}>
      <Heading
        title={["Merge a PR", "Get Paid on Merit Systems"]}
        description="Every PR merged into Toolkit is paid based on its impact. The more impactful the PR, the more money you earn."
        badgeText="How Payouts Work"
        buttons={[
          <Link
            href="https://terminal.merit.systems/jasonhedman/toolkit.dev"
            key="terminal"
            target="_blank"
          >
            <Button className="user-message">Explore Merit Systems</Button>
          </Link>,
          <Link
            href="https://github.com/jasonhedman/toolkit.dev/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22"
            key="github"
            target="_blank"
          >
            <Button variant="outline">
              <SiGithub />
              Good First Issues
            </Button>
          </Link>,
        ]}
        align="center"
      />
      <div
        ref={containerRef}
        className="relative flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12"
      >
        <VStack className="flex-1 items-start gap-2">
          <PrCard
            title="Add chat UI with rate limiting"
            number={3}
            additions={3611}
            deletions={28}
            mergedAt={new Date("2025-06-08")}
            dollars={428.79}
            ref={pr1Ref}
            side="right"
          />
          <PrCard
            title="Implement workbench system"
            number={53}
            additions={1677}
            deletions={404}
            mergedAt={new Date("2025-06-16")}
            dollars={343.18}
            ref={pr2Ref}
            side="right"
          />
        </VStack>

        <MeritCard leftRef={meritLeftRef} rightRef={meritRightRef} />

        <div className="flex flex-1 flex-col gap-2">
          <PrCard
            title="Serve Toolkits as MCP Servers"
            number={23}
            additions={1248}
            deletions={236}
            mergedAt={new Date("2025-06-13")}
            dollars={228.08}
            ref={pr3Ref}
            side="left"
          />
          <YourPrCard ref={pr4Ref} />
        </div>
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={meritLeftRef}
          toRef={pr1Ref}
          duration={6}
          reverse={true}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={meritLeftRef}
          toRef={pr2Ref}
          duration={6}
          reverse={true}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={meritRightRef}
          toRef={pr3Ref}
          duration={6}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={meritRightRef}
          toRef={pr4Ref}
          duration={6}
        />
      </div>
    </Section>
  );
};

interface MeritCardProps {
  leftRef: React.RefObject<HTMLDivElement | null>;
  rightRef: React.RefObject<HTMLDivElement | null>;
}

const MeritCard: React.FC<MeritCardProps> = ({ leftRef, rightRef }) => {
  return (
    <Card className="relative z-10 shrink-0 flex-col items-center gap-2 p-2 md:flex-row md:gap-4 md:p-4">
      <Handle side="left" ref={leftRef} />
      <Logo className="size-8 md:size-10" />
      <VStack className="hidden items-start gap-0 md:flex">
        <p className="text-xs font-light opacity-60 md:text-sm">
          Merit Systems
        </p>
        <h1 className="hidden text-2xl font-bold md:block">Toolkit Account</h1>
      </VStack>
      <Handle side="right" ref={rightRef} />
    </Card>
  );
};

const PrCardWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Card
      className={cn(
        "relative z-10 flex w-full flex-col items-start justify-between gap-1 p-2",
        className,
      )}
    >
      {children}
    </Card>
  );
};

interface PrCardProps {
  title: string;
  number: number;
  additions: number;
  deletions: number;
  mergedAt: Date;
  dollars: number;
  side: "left" | "right";
}

const PrCard = React.forwardRef<HTMLDivElement, PrCardProps>(
  ({ title, number, additions, deletions, mergedAt, dollars, side }, ref) => {
    return (
      <PrCardWrapper>
        <Handle side={side} ref={ref} />
        <HStack className="w-full justify-between text-xs font-bold md:text-lg">
          <p className="font-bold">PR #{number}</p>
          <p className="text-primary font-bold">${dollars}</p>
        </HStack>
        <h3 className="text-[8px] font-medium opacity-80 md:text-sm">
          {title}
        </h3>
        <HStack className="hidden w-full justify-between text-xs font-light opacity-60 md:flex">
          <p>{mergedAt.toLocaleDateString()}</p>
          <HStack className="gap-1 font-mono">
            <p className="text-green-500">+{additions.toLocaleString()}</p>
            <p className="text-red-500">-{deletions.toLocaleString()}</p>
          </HStack>
        </HStack>
      </PrCardWrapper>
    );
  },
);
PrCard.displayName = "PrCard";

const YourPrCard = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <PrCardWrapper className="border-primary shadow-primary shadow-[0_0_10px]">
      <Handle side="left" ref={ref} />
      <HStack className="w-full justify-between text-xs font-bold md:text-lg">
        <p className="font-bold">Your PR</p>
        <p className="text-primary font-bold">$???</p>
      </HStack>
      <h3 className="text-[8px] font-medium opacity-80 md:text-sm">
        Anything that improves Toolkit
      </h3>
      <HStack className="hidden w-full justify-between text-xs font-light opacity-60 md:flex">
        <p>Start Today</p>
      </HStack>
    </PrCardWrapper>
  );
});
YourPrCard.displayName = "YourPrCard";
