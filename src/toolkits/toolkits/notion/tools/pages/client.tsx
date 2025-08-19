import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getPageTool, searchPagesTool, createPageTool } from "./base";
import { FileText, Search, Plus } from "lucide-react";
import { ToolCallDisplay } from "../../components";
import { NotionPage } from "../../components/page";

export const notionGetPageToolConfigClient: ClientToolConfig<
  typeof getPageTool.inputSchema.shape,
  typeof getPageTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={FileText}
        label="Get Page"
        value={`${(args.page_id ?? "").slice(0, 8)}...`}
      />
    );
  },
  ResultComponent: ({ result: { page }, append }) => {
    return (
      <NotionPage
        page={page}
        onClick={() => {
          void append({ text: `Get the content of page ${page.id}` });
        }}
      />
    );
  },
};

export const notionSearchPagesToolConfigClient: ClientToolConfig<
  typeof searchPagesTool.inputSchema.shape,
  typeof searchPagesTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={Search}
        label="Search Pages"
        value={`"${args.query ?? ""}"`}
      />
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.results.length) {
      return <div className="text-muted-foreground">No pages found</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Page Search Results
        </h1>
        <div className="flex flex-col">
          {result.results.map((page) => {
            return (
              <NotionPage
                key={page.id}
                page={page}
                onClick={() => {
                  void append({ text: `Get the content of page ${page.id}` });
                }}
              />
            );
          })}
        </div>
        {result.has_more && (
          <p className="text-muted-foreground pt-2 text-xs">
            More pages available...
          </p>
        )}
      </div>
    );
  },
};

export const notionCreatePageToolConfigClient: ClientToolConfig<
  typeof createPageTool.inputSchema.shape,
  typeof createPageTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={Plus}
        label="Create Page"
        value={`"${args.title ?? ""}"`}
      />
    );
  },
  ResultComponent: ({ result: { page }, append }) => {
    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Page Created
        </h1>
        <NotionPage
          page={page}
          onClick={() => {
            void append({ text: `Get the content of page ${page.id}` });
          }}
        />
      </div>
    );
  },
};
