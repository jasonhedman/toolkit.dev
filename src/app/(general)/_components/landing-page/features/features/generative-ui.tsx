"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";

import { AnimatePresence, motion } from "motion/react";

import { Card } from "@/components/ui/card";
import { HStack, VStack } from "@/components/ui/stack";

import { Brain, File, Plus, Search } from "lucide-react";
import { SiNotion } from "@icons-pack/react-simple-icons";

const toolkits = [
  {
    heading: "Search Toolkit",
    icon: Search,
    component: (
      <HStack>
        <VStack className="items-start gap-0">
          <h3 className="text-sm font-medium">Vercel AI SDK</h3>
          <p className="text-xs">Library for building AI-powered web apps</p>
        </VStack>
        <Image
          src="/icons/vercel.png"
          alt="Vercel AI SDK"
          width={32}
          height={32}
          className="rounded-md"
        />
      </HStack>
    ),
  },
  {
    heading: "Memory Toolkit",
    icon: Brain,
    component: (
      <HStack>
        <VStack className="items-start gap-0">
          <h3 className="text-sm font-medium">Memory Added</h3>
          <p className="text-xs">
            User is an experienced Next.js and AI application developer
          </p>
        </VStack>
        <Plus className="size-8" />
      </HStack>
    ),
  },
  {
    heading: "Notion Toolkit",
    icon: SiNotion,
    component: (
      <HStack>
        <VStack className="items-start gap-0">
          <h3 className="text-sm font-medium">To-do Created</h3>
          <p className="text-xs">
            Added a bug to the Engineering team&apos;s database
          </p>
        </VStack>
        <File className="size-8" />
      </HStack>
    ),
  },
];

export const GenerativeUI: React.FC = () => {
  const [toolIndex, setToolIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setToolIndex((toolIndex) => (toolIndex + 1) % toolkits.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const toolkit = toolkits[toolIndex]!;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={toolIndex}
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -10,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex h-[122px] w-full flex-col justify-center"
      >
        <Card className="w-full gap-0 overflow-hidden p-0">
          <HStack className="border-b p-2">
            <div className="border-primary bg-muted flex items-center justify-center rounded-full border p-1">
              <toolkit.icon className="text-primary size-4" />
            </div>
            <span className="font-semibold">{toolkit.heading}</span>
          </HStack>
          <motion.div
            className="p-2"
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {toolkits[toolIndex]!.component}
          </motion.div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
