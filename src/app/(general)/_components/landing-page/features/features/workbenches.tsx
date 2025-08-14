"use client";

import React, { useEffect, useState } from "react";

import { Anvil } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/stack";

import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";

import { Toolkits } from "@/toolkits/toolkits/shared";

const workbenchExamples = [
  {
    title: "Repo Researcher",
    systemPrompt:
      "Find the latest trending repositories each day and write to my Notion.",
    toolkits: [Toolkits.Exa, Toolkits.Github, Toolkits.Notion],
  },
  {
    title: "Data Analyst",
    systemPrompt: "Analyze and visualize trending stocks from Yahoo Finance.",
    toolkits: [Toolkits.E2B, Toolkits.Memory, Toolkits.GoogleDrive],
  },
  {
    title: "Project Manager",
    systemPrompt:
      "Find availability on my Google Calendar to meet with my engineering team.",
    toolkits: [Toolkits.GoogleCalendar, Toolkits.Notion, Toolkits.Memory],
  },
];

export const Workbenches: React.FC = () => {
  const [toolIndex, setToolIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setToolIndex((toolIndex) => (toolIndex + 1) % workbenchExamples.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const example = workbenchExamples[toolIndex]!;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={toolIndex}
        initial={{
          opacity: 0,
          x: 10,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        exit={{
          opacity: 0,
          x: -10,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex h-[122px] w-full flex-col justify-center"
      >
        <Card className="w-full gap-1 overflow-hidden p-2">
          <HStack>
            <Anvil className="size-4" />
            <span className="font-semibold">{example.title}</span>
          </HStack>
          <p className="text-xs font-light">{example.systemPrompt}</p>
          <ToolkitIcons toolkits={example.toolkits} />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
