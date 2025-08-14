import type { ClientToolConfig} from "@/toolkits/types";
import type { getListing } from "./base";

export const getListingClientConfig: ClientToolConfig<
  typeof getListing.inputSchema.shape,
  typeof getListing.outputSchema.shape
> = {
  CallComponent: ({ args, isPartial }) => (
    <div className="flex items-center gap-2">
      <span>🔍</span>
      <span>Searching for: {args.listingId}</span>
      {isPartial && <span className="animate-pulse">...</span>}
    </div>
  ),
  ResultComponent: ({ args, result }) => (
    <div className="border rounded p-4">
      <h3>Search Results for: {args.listingId}</h3>
      <p>{result.title}</p>
      <p>{result.price}</p>
    </div>
  )
};