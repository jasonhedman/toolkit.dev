import React from "react";

import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HStack, VStack } from "@/components/ui/stack";
import { Markdown } from "@/components/ui/markdown";

export interface ResultData {
  title: string | null;
  url: string;
  content: string;
  publishedDate?: string;
  image?: string;
  favicon?: string;
  score?: number;
  author?: string;
}

interface ResultItemProps {
  result: ResultData;
  index: number;
  linkText?: string;
}

export const ResultItem: React.FC<ResultItemProps> = ({
  result,
  index,
  linkText = "Read full article →",
}) => {
  return (
    <Dialog key={index}>
      <DialogTrigger asChild>
        <HStack className="group w-full cursor-pointer items-center border-b py-2 last:border-b-0 last:pb-0">
          <div className="mt-1 size-4 shrink-0 overflow-hidden rounded-sm">
            {result.favicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.favicon} alt="Favicon" className="size-full" />
            ) : (
              <div className="bg-muted size-full rounded-full" />
            )}
          </div>
          <VStack className="group flex w-full cursor-pointer items-start gap-0">
            <h3 className="group-hover:text-primary line-clamp-2 transition-colors">
              {result.title}
            </h3>
            <p className="text-muted-foreground text-xs">
              {result.publishedDate
                ? new Date(result.publishedDate).toLocaleDateString()
                : "No published date"}
              {result.author && <> • {result.author}</>}
            </p>
          </VStack>
          {result.image && (
            <div className="h-10 shrink-0 overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.image}
                alt="Image"
                className="h-full object-contain"
              />
            </div>
          )}
        </HStack>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{result.title}</DialogTitle>
          <DialogDescription>
            {result.publishedDate
              ? new Date(result.publishedDate).toLocaleDateString()
              : "No published date"}
            {result.author && <> • {result.author}</>}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full overflow-hidden">
          <Markdown>{result.content}</Markdown>
        </div>
        <DialogFooter>
          <Link
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:bg-primary/10 rounded-md p-1 transition-colors"
          >
            {linkText}
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
