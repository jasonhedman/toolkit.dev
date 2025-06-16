import React from "react";
import type { ClientToolConfig } from "@/toolkits/types";
import type {
  listDatabasesTool,
  queryDatabaseTool,
  createDatabaseTool,
} from "./base";
import { Database, Search, Plus } from "lucide-react";
import { ToolCallDisplay } from "../../components";
import { NotionDatabase } from "../../components/database";
import { NotionPage } from "../../components/page";

export const notionListDatabasesToolConfigClient: ClientToolConfig<
  typeof listDatabasesTool.inputSchema.shape,
  typeof listDatabasesTool.outputSchema.shape
> = {
  CallComponent: ({}) => {
    return (
      <ToolCallDisplay
        icon={Database}
        label="List Databases"
        value="Fetching databases..."
      />
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.databases.length) {
      return <div className="text-muted-foreground">No databases found</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Notion Databases
        </h1>
        <div className="flex flex-col">
          {result.databases.map((db) => (
            <NotionDatabase
              key={db.id}
              database={db}
              onClick={() => {
                void append({
                  role: "user",
                  content: `Query the database "${db.title?.[0]?.plain_text ?? "Untitled Database"}" for its content`,
                });
              }}
            />
          ))}
        </div>
        {result.has_more && (
          <p className="text-muted-foreground mt-2 text-xs">
            More databases available...
          </p>
        )}
      </div>
    );
  },
};

export const notionQueryDatabaseToolConfigClient: ClientToolConfig<
  typeof queryDatabaseTool.inputSchema.shape,
  typeof queryDatabaseTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={Search}
        label="Query Database"
        value={`${(args.database_id ?? "").slice(0, 8)}...`}
      />
    );
  },
  ResultComponent: ({ result, append }) => {
    if (!result.results.length) {
      return <div className="text-muted-foreground">No results found</div>;
    }

    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Database Query Results
        </h1>
        <div className="flex flex-col">
          {result.results.map((result) =>
            result.object === "page" ? (
              <NotionPage
                key={result.id}
                page={result}
                onClick={() => {
                  void append({
                    role: "user",
                    content: `Get the content of page ${result.id}`,
                  });
                }}
              />
            ) : (
              <NotionDatabase
                key={result.id}
                database={result}
                onClick={() => {
                  void append({
                    role: "user",
                    content: `Query the database "${result.title?.[0]?.plain_text ?? "Untitled Database"}" for its content`,
                  });
                }}
              />
            ),
          )}
        </div>
        {result.has_more && (
          <p className="text-muted-foreground mt-2 text-xs">
            More results available...
          </p>
        )}
      </div>
    );
  },
};

export const notionCreateDatabaseToolConfigClient: ClientToolConfig<
  typeof createDatabaseTool.inputSchema.shape,
  typeof createDatabaseTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={Plus}
        label="Create Database"
        value={`"${args.title ?? ""}"`}
      />
    );
  },
  ResultComponent: ({ result: { database }, append }) => {
    return (
      <div className="">
        <h1 className="text-muted-foreground text-sm font-medium">
          Database Created
        </h1>
        <NotionDatabase
          database={database}
          onClick={() => {
            void append({
              role: "user",
              content: `Query the database "${database.title?.[0]?.plain_text ?? "Untitled Database"}" for its content`,
            });
          }}
        />
      </div>
    );
  },
};
