import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

// Minimal placeholder until official types verified
interface Listing { listing_id: number | string; title?: string; url?: string; [k: string]: unknown }

export const getListings = createBaseTool({
  description:
    "Fetches all listings from the Etsy shop associated with the authenticated user.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    results: z.array(z.custom<Listing>()),
  }),
});
