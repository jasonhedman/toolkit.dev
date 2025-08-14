"use client";

import React, { useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { Code } from "@/components/ui/code";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HStack, VStack } from "@/components/ui/stack";

import { Section } from "../lib/section";
import { Heading } from "../lib/heading";

import { SECTIONS } from "../sections";

import { toolkitCreationSteps } from "./data";

import { cn } from "@/lib/utils";

export const ToolkitCreationSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <Section id={SECTIONS.ToolkitCreation}>
      <Heading
        title={["Designed to Facilitate", "Seamless Toolkit Creation"]}
        description="Create powerful AI agent systems with our intuitive SDK. From simple workflows to complex multi-agent collaborations."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Tabs
          value={activeTab.toString()}
          onValueChange={(value) => setActiveTab(Number(value))}
          className="flex w-full max-w-full flex-col gap-2 overflow-hidden"
        >
          <TabsList className="no-scrollbar flex h-fit w-full flex-row justify-start gap-2 overflow-x-auto bg-transparent">
            {toolkitCreationSteps.map((step, index) => (
              <div
                key={index}
                className="h-full min-w-64 flex-1 shrink-0 md:min-w-72"
              >
                <TabsTrigger
                  value={index.toString()}
                  className="hover:border-primary/50 border-border data-[state=active]:border-primary data-[state=active]:bg-card dark:data-[state=active]:border-primary dark:data-[state=active]:bg-card group h-auto w-full shrink-0 overflow-hidden rounded-lg p-2 text-left transition-colors md:p-4"
                  asChild
                >
                  <VStack className="items-start gap-0 md:flex-1">
                    <HStack className="w-full max-w-full">
                      <div
                        className={cn(
                          "bg-muted/60 flex shrink-0 items-center justify-center font-bold",
                          "size-4 md:size-6",
                          "group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground group-hover:bg-primary/10 rounded-full transition-colors",
                        )}
                      >
                        {index + 1}
                      </div>
                      <h3 className="w-full max-w-full text-base font-semibold text-wrap md:text-lg">
                        {step.title}
                      </h3>
                    </HStack>
                    <p className="text-muted-foreground max-w-full text-xs leading-relaxed text-wrap md:text-sm">
                      {step.description}
                    </p>
                  </VStack>
                </TabsTrigger>
              </div>
            ))}
          </TabsList>
          <div className="bg-card relative col-span-7 rounded-lg border">
            <AnimatePresence mode="wait">
              {toolkitCreationSteps[activeTab]?.code && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 overflow-hidden"
                >
                  <Code
                    value={toolkitCreationSteps[activeTab].code}
                    lang="ts"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Invisible placeholder to maintain height */}
            <div className="invisible">
              <Code value={toolkitCreationSteps[0]?.code ?? ""} lang="ts" />
            </div>
          </div>
        </Tabs>
      </motion.div>
    </Section>
  );
};
