"use client";

import { useEffect, useState } from "react";

import { ToolkitIcon } from "@/components/toolkit/toolkit-icons";

import { Toolkits } from "@/toolkits/toolkits/shared";
import { cn } from "@/lib/utils";

const toolkitSets = [
  [Toolkits.Exa, Toolkits.Github, Toolkits.Notion, Toolkits.GoogleCalendar],
  [
    Toolkits.Image,
    Toolkits.GoogleCalendar,
    Toolkits.Memory,
    Toolkits.GoogleDrive,
  ],
  [Toolkits.GoogleDrive, Toolkits.E2B, Toolkits.Exa, Toolkits.Github],
  [Toolkits.Github, Toolkits.Image, Toolkits.GoogleCalendar, Toolkits.Memory],
];

const DURATION = 5000;

export const ToggleTools = () => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setCurrentSetIndex((prev) => (prev + 1) % toolkitSets.length);
        setIsAnimatingOut(false);
      }, 900);
    }, DURATION); // Increased time to allow for animations

    return () => clearInterval(interval);
  }, []);

  const currentToolkits = toolkitSets[currentSetIndex];

  return (
    <div className="grid w-full grid-cols-8 gap-2 md:grid-cols-4 md:gap-4">
      {Object.entries(Toolkits).map(([key, value]) => {
        const isSelected = currentToolkits?.includes(value) && !isAnimatingOut;
        return (
          <div
            key={key}
            className={cn(
              "bg-card flex size-12 items-center justify-center rounded-full border p-2.5 opacity-20 transition-all duration-300",
              isSelected && "opacity-100",
            )}
          >
            <ToolkitIcon toolkit={value} className="size-full md:size-full" />
          </div>
        );
      })}
    </div>
  );
};
