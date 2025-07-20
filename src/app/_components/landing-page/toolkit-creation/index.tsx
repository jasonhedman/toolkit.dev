"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Code, type LucideIcon } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { HStack, VStack } from "@/components/ui/stack";
import { toolkitCreationTabs } from "./data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ToolkitCreationSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(toolkitCreationTabs[0].id);

  const activeTabData = toolkitCreationTabs.find(tab => tab.id === activeTab);

  return (
    <section
      className="from-background to-muted/20 bg-gradient-to-b py-24"
      id="toolkit-creation"
    >
      <div className="container mx-auto px-2 md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Create Custom Toolkits
            <span className="text-primary block">In Minutes, Not Hours</span>
          </h2>
          <p className="text-muted-foreground mx-auto mb-4 max-w-2xl text-lg">
            Building new AI capabilities is as simple as defining your tools.
            Configure server tools and client tools, and it automatically works
            with the entire system.
          </p>
          <Link href="https://github.com/jasonhedman/toolkit.dev/tree/main/src/toolkits">
            <Button className="user-message">
              <Code className="size-4" />
              Start Building
            </Button>
          </Link>
        </motion.div>

        {/* Tabs and Content Container */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Tabs - Mobile: horizontal scroll, Desktop: vertical */}
          <div className="lg:col-span-2">
            {/* Mobile tabs */}
            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {toolkitCreationTabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="min-w-max"
                  />
                ))}
              </div>
            </div>

            {/* Desktop tabs */}
            <div className="hidden lg:block">
              <VStack className="gap-2">
                {toolkitCreationTabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full"
                  />
                ))}
              </VStack>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
            {activeTabData && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <CodeBlock
                  language="typescript"
                  value={activeTabData.code}
                  heading="Example Code"
                  showLineNumbers={true}
                  allowCopy={true}
                  headerClassName="bg-primary/20 dark:bg-primary/20 py-3"
                  headingClassName="text-lg font-bold"
                  className="h-full min-h-[500px]"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const TabButton: React.FC<{
  tab: {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
  };
  isActive: boolean;
  onClick: () => void;
  className?: string;
}> = ({ tab, isActive, onClick, className }) => {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
        isActive
          ? "bg-primary/10 border-primary/50 shadow-md"
          : "bg-card border-border hover:bg-muted/50",
        className
      )}
    >
      <HStack className="gap-3 items-start">
        <div className={cn(
          "rounded-lg p-2 shrink-0",
          isActive ? "bg-primary/20" : "bg-primary/10"
        )}>
          <Icon className="size-5" />
        </div>
        <VStack className="gap-1 min-w-0">
          <CardTitle className="text-sm font-semibold leading-tight">
            {tab.title}
          </CardTitle>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {tab.description}
          </p>
        </VStack>
      </HStack>
    </button>
  );
};
