import React from "react";
import { FileSearch, Search, Star } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { type searchUploadedFilesTool } from "./base";

import type { ClientToolConfig } from "@/toolkits/types";

export const fileRagSearchUploadedFilesToolConfigClient: ClientToolConfig<
  typeof searchUploadedFilesTool.inputSchema.shape,
  typeof searchUploadedFilesTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => (
    <div className="bg-muted flex items-center gap-2 rounded-md p-3 text-sm">
      <Search className="size-4 shrink-0" />
      <span className="truncate">
        Searching uploaded files for {args.query ? `"${args.query}"` : "..."}
      </span>
    </div>
  ),
  ResultComponent: ({ result }) => {
    if (result.results.length === 0) {
      return (
        <div className="text-muted-foreground text-sm">
          No indexed file chunks found
        </div>
      );
    }

    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="file-search-results">
          <AccordionTrigger className="cursor-pointer p-0 hover:no-underline">
            <h3 className="text-primary flex items-center gap-2 text-sm font-medium">
              <FileSearch className="size-4" />
              Found {result.results.length} file chunk
              {result.results.length === 1 ? "" : "s"}
            </h3>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            {result.results.map((item) => (
              <div
                className="border-b py-2 last:border-b-0 last:pb-0"
                key={item.chunkId}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {item.fileName}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Star className="size-3" />
                    {(item.score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-3 text-xs">
                  {item.content}
                </p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
};
