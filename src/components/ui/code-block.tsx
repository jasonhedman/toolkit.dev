"use client";

import { memo, useState } from "react";

import { Check, Copy } from "lucide-react";

import { useCopyToClipboard } from "usehooks-ts";

import { Code } from "@/components/ui/code";
import { Card } from "@/components/ui/card";

import { cn } from "@/lib/utils";

import type { BundledLanguage } from "./code/shiki.bundle";

interface Props {
  language: BundledLanguage;
  value: string;
  heading?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
  headerClassName?: string;
  headingClassName?: string;
}

export const markdownLanguages: Record<BundledLanguage, string> = {
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  python: "Python",
  py: "Python",
  java: "Java",
  c: "C",
  csharp: "C#",
  "c#": "C#",
  cs: "C#",
  cpp: "C++",
  "c++": "C++",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  php: "PHP",
  ruby: "Ruby",
  rb: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  kt: "Kotlin",
  kts: "Kotlin",
  dart: "Dart",
  scala: "Scala",
  r: "R",
  matlab: "MATLAB",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  vue: "Vue",
  jsx: "JavaScript React",
  tsx: "TypeScript React",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
  shellscript: "Shell",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  powershell: "PowerShell",
  ps: "PowerShell",
  ps1: "PowerShell",
  docker: "Docker",
  dockerfile: "Dockerfile",
  terraform: "Terraform",
  tf: "Terraform",
  tfvars: "Terraform",
  graphql: "GraphQL",
  gql: "GraphQL",
  solidity: "Solidity",
  svelte: "Svelte",
  astro: "Astro",
};

export const CodeBlock: React.FC<Props> = memo(
  ({
    language,
    value,
    heading,
    allowCopy = true,
    headerClassName,
    headingClassName,
  }: Props) => {
    const [isCopied, setIsCopied] = useState(false);
    const [, copyToClipboard] = useCopyToClipboard();

    const onCopy = async () => {
      if (isCopied) return;
      const success = await copyToClipboard(value);
      if (success) {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }
    };

    return (
      <Card
        className={cn(
          "codeblock relative w-full max-w-full gap-0 overflow-hidden overflow-x-auto rounded-md py-0 font-sans",
        )}
      >
        <div
          className={cn(
            "bg-primary/10 flex w-full items-center justify-between py-1 pr-2 pl-4",
            headerClassName,
          )}
        >
          <span className={cn("text-xs font-semibold", headingClassName)}>
            {heading ?? markdownLanguages[language] ?? language}
          </span>
          <div className="flex items-center gap-2">
            {allowCopy && (
              <span
                className="h-fit w-fit cursor-pointer rounded-md p-2 text-xs transition-colors duration-200 hover:bg-neutral-200 focus-visible:ring-offset-0 dark:hover:bg-neutral-600"
                onClick={onCopy}
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy code</span>
              </span>
            )}
          </div>
        </div>
        <Code value={value} lang={language} />
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.language === nextProps.language
    );
  },
);

CodeBlock.displayName = "CodeBlock";
