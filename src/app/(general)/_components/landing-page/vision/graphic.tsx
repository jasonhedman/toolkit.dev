"use client";

import { useRef } from "react";

import { HandCoins, TrendingUp, Users } from "lucide-react";

import { Card } from "@/components/ui/card";

import { Handle } from "../lib/handle";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { HStack } from "@/components/ui/stack";
import { Logo } from "@/components/ui/logo";

const cardWidth = "w-24 md:w-32";
const cardHeight = "h-24 md:h-32";
const cardSize = `${cardWidth} ${cardHeight}`;
const gapHeight = "h-8 md:h-16";
const gapWidth = "w-8 md:w-16";

const duration = 2;
const overlap = duration * 0.5;

const beamProps = (index: number) => ({
  duration: duration,
  repeatDelay: (duration - overlap) * 3 - overlap,
  delay: (duration - overlap) * index,
  reverse: [2, 3].includes(index),
  isVertical: [1, 3].includes(index),
  beamWidth: 40,
});

export const VisionGraphic: React.FC = () => {
  const card1Source = useRef<HTMLDivElement>(null);
  const card1Target = useRef<HTMLDivElement>(null);
  const card2Source = useRef<HTMLDivElement>(null);
  const card2Target = useRef<HTMLDivElement>(null);
  const card3Source = useRef<HTMLDivElement>(null);
  const card3Target = useRef<HTMLDivElement>(null);
  const card4Source = useRef<HTMLDivElement>(null);
  const card4Target = useRef<HTMLDivElement>(null);
  const beam12Container = useRef<HTMLDivElement>(null);
  const beam23Container = useRef<HTMLDivElement>(null);
  const beam34Container = useRef<HTMLDivElement>(null);
  const beam41Container = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Top card */}
      <HStack className="justify-center gap-0">
        <CycleCard
          source={{ side: "right", ref: card1Source }}
          target={{ side: "bottom", ref: card1Target }}
          Icon={Users}
          title="Attract Contributors"
        />
        <div
          className={cn(gapWidth, cardHeight, "relative")}
          ref={beam12Container}
        >
          <AnimatedBeam
            fromRef={card1Source}
            toRef={card2Target}
            containerRef={beam12Container}
            {...beamProps(0)}
          />
        </div>
        <CycleCard
          source={{ side: "bottom", ref: card2Source }}
          target={{ side: "left", ref: card2Target }}
          Icon={Logo}
          title="Improve Product"
        />
      </HStack>

      <HStack className="justify-center gap-0">
        <div
          className={cn(cardWidth, gapHeight, "relative")}
          ref={beam41Container}
        >
          <AnimatedBeam
            fromRef={card4Source}
            toRef={card1Target}
            containerRef={beam41Container}
            {...beamProps(3)}
          />
        </div>
        <div
          className={cn(gapWidth, gapHeight, "relative")}
          ref={beam34Container}
        />
        <div
          className={cn(cardWidth, gapHeight, "relative")}
          ref={beam23Container}
        >
          <AnimatedBeam
            fromRef={card2Source}
            toRef={card3Target}
            containerRef={beam23Container}
            {...beamProps(1)}
          />
        </div>
      </HStack>

      <HStack className="justify-center gap-0">
        <CycleCard
          source={{ side: "top", ref: card4Source }}
          target={{ side: "right", ref: card4Target }}
          Icon={HandCoins}
          title="Distribute Revenue"
        />
        <div
          className={cn(gapWidth, cardHeight, "relative")}
          ref={beam34Container}
        >
          <AnimatedBeam
            fromRef={card3Source}
            toRef={card4Target}
            containerRef={beam34Container}
            {...beamProps(2)}
          />
        </div>
        <CycleCard
          source={{ side: "left", ref: card3Source }}
          target={{ side: "top", ref: card3Target }}
          Icon={TrendingUp}
          title="Monetize Platform"
        />
      </HStack>
    </div>
  );
};

interface HandleProps {
  side: "top" | "left" | "right" | "bottom";
  ref: React.RefObject<HTMLDivElement | null>;
}

interface CycleCardProps {
  source: HandleProps;
  target: HandleProps;
  Icon: React.FC<{ className?: string }>;
  title: string;
  className?: string;
}

const CycleCard: React.FC<CycleCardProps> = ({
  source,
  target,
  Icon,
  title,
  className,
}) => {
  return (
    <Card
      className={cn(
        "relative items-center justify-center gap-2 p-2 text-center",
        cardSize,
        className,
      )}
    >
      <Handle side={source.side} ref={source.ref} />
      <Icon className="size-8" />
      <h3 className="text-xs font-semibold md:text-sm">{title}</h3>
      <Handle side={target.side} ref={target.ref} />
    </Card>
  );
};
