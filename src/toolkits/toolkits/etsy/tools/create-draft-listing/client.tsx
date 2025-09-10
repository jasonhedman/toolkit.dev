import { Search } from "lucide-react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { createDraftListing } from "./base";

export const createDraftListingClientConfig: ClientToolConfig<
  typeof createDraftListing.inputSchema.shape,
  typeof createDraftListing.outputSchema.shape
> = {
  CallComponent: ({ isPartial }) => (
    <div className="flex items-center gap-2">
      <Search className="h-4 w-4" />
      {isPartial && <span className="animate-pulse">...</span>}
    </div>
  ),
  ResultComponent: ({ result: { result } }) => (
    <div className="space-y-2">
      <h2 className="text-lg font-bold">Listing</h2>
      <div key={result.listing_id}>{result.title}</div>)
    </div>
  ),
};
