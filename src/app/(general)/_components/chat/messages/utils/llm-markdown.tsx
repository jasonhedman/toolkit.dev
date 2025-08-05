"use client";

import React from "react";

import { useLLMOutput, type LLMOutputComponent } from "@llm-ui/react";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from "@llm-ui/code";

import { Markdown, type MarkdownProps } from "@/components/ui/markdown";
import { LLMCodeBlock } from "./llm-code-block";

type LLMMarkdownProps = Omit<MarkdownProps, "children">;

interface Props extends Omit<MarkdownProps, "children"> {
  isStreamFinished: boolean;
  llmOutput: string;
}

export const LLMMarkdown: React.FC<Props> = ({
  llmOutput,
  isStreamFinished = true,
  ...props
}) => {
  const { blockMatches } = useLLMOutput({
    llmOutput,
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
    blocks: [
      {
        component: LLMCodeBlock,
        findCompleteMatch: findCompleteCodeBlock(),
        findPartialMatch: findPartialCodeBlock(),
        lookBack: codeBlockLookBack(),
      },
    ],
    isStreamFinished,
  });

  return (
    <div className="flex flex-col gap-2">
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block
          .component as LLMOutputComponent<LLMMarkdownProps>;
        return <Component key={index} blockMatch={blockMatch} {...props} />;
      })}
    </div>
  );
};

const MarkdownComponent: LLMOutputComponent<LLMMarkdownProps> = ({
  blockMatch,
  ...props
}) => {
  const markdown = blockMatch.output;

  return <Markdown {...props}>{markdown}</Markdown>;
};
