"use client";

import { parsePartialMarkdownCodeBlock } from "@llm-ui/code";

import type { LLMOutputComponent } from "@llm-ui/react";
import type { BundledLanguage } from "@/components/ui/code/shiki.bundle";
import { CodeBlock } from "@/components/ui/code-block";

export const LLMCodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const { code, language } = parsePartialMarkdownCodeBlock(blockMatch.output);

  if (!code || !language) {
    return null;
  }

  return <CodeBlock value={code} language={language as BundledLanguage} />;
};
