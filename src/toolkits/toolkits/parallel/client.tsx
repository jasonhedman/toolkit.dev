import { Globe, Search } from "lucide-react";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { ToolkitGroups, type ClientToolConfig } from "@/toolkits/types";
import { ResultsList, ToolCallDisplay } from "../exa/components";
import {
  baseParallelToolkitConfig,
  ParallelTools,
  parallelOutput,
} from "./base";
import type { z } from "zod";

export const ParallelResults = ({
  result,
}: {
  result: z.infer<typeof parallelOutput>;
}) => (
  <div>
    <ResultsList
      results={result.results}
      title="Web Sources"
      emptyMessage="No results found"
      linkText="Open source →"
    />
    {result.warnings.map((warning, index) => (
      <p key={index} role="status" className="text-muted-foreground text-sm">
        {warning}
      </p>
    ))}
  </div>
);

const searchClient: ClientToolConfig<
  typeof baseParallelToolkitConfig.tools.search.inputSchema.shape,
  typeof parallelOutput.shape
> = {
  CallComponent: ({ args }) => (
    <ToolCallDisplay
      icon={Search}
      label="Web Search"
      value={args.objective ?? "..."}
    />
  ),
  ResultComponent: ({ result }) => (
    <ParallelResults result={parallelOutput.parse(result)} />
  ),
};

const fetchClient: ClientToolConfig<
  typeof baseParallelToolkitConfig.tools.fetch.inputSchema.shape,
  typeof parallelOutput.shape
> = {
  CallComponent: ({ args }) => (
    <ToolCallDisplay
      icon={Globe}
      label="Read Pages"
      value={args.urls?.join(", ") ?? "..."}
    />
  ),
  ResultComponent: ({ result }) => (
    <ParallelResults result={parallelOutput.parse(result)} />
  ),
};

export const parallelClientToolkit = createClientToolkit(
  baseParallelToolkitConfig,
  {
    name: "Parallel Web Search",
    description:
      "Search the web and read pages for free, without a search account or API key",
    icon: Globe,
    form: null,
    type: ToolkitGroups.DataSource,
    envVars: [],
  },
  {
    [ParallelTools.Search]: searchClient,
    [ParallelTools.Fetch]: fetchClient,
  },
);
