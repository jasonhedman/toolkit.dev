import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { IShopListing } from "etsy-ts";

export const getListings = createBaseTool({
  description:
    "Fetches all listings from the Etsy shop associated with the authenticated user." +
    "No additional input is required. But there are optional ones:" +
    "limit — page size (default 25; max 100)" +
    "offset — number of results to skip (use for pagination)" +
    "sort_on — field to sort by (e.g., created, updated, price, score). Note: some sorts only work when combined with a search option; score is always descending regardless of sort_order." +
    "sort_order — up (ascending) or down (descending), when supported by the chosen sort_on." +
    "includes - An enumerated string that attaches a valid association. Acceptable inputs are 'Shipping', 'Shop', 'Images', 'User', 'Translations' and 'Inventory'.",
  inputSchema: z.object({
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe(
        "Maximum number of items to return. Default: 25. Min: 1. Max: 100",
      ),
    sort_on: z
      .enum(["created", "updated", "price", "score"])
      .optional()
      .describe(
        "Field to sort by (e.g., created, updated, price, score). Note: some sorts only work when combined with a search option; score is always descending regardless of sort_order. Default: created",
      ),
    sort_order: z
      .enum(["asc", "desc", "up", "down"])
      .optional()
      .describe(
        "Sort order: up (ascending) or down (descending). Default: desc",
      ),
    offset: z
      .number()
      .min(0)
      .optional()
      .describe("Number of results to skip (use for pagination). Default: 0"),
    includes: z
      .enum([
        "Shipping",
        "Images",
        "Shop",
        "User",
        "Translations",
        "Inventory",
        "Videos",
      ])
      .array()
      .optional()
      .describe(
        "An enumerated string that attaches a valid association. Acceptable inputs are 'Shipping', 'Shop', 'Images', 'User', 'Translations' and 'Inventory'.",
      ),
  }),
  outputSchema: z.object({
    results: z.array(z.custom<IShopListing>()),
  }),
});
