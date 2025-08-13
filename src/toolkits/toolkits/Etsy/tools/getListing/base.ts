import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import { ShopListing } from "etsy-ts/dist/api/ShopListing";
import type { IShopListingsWithAssociations } from "etsy-ts";

export const getListing = createBaseTool({
  description: "Fetches all listings from the Etsy shop associated with the authenticated user.",
  inputSchema: z.object({
  }),
  outputSchema: z.object({
    listings: z.custom<IShopListingsWithAssociations>()
  })
  // outputSchema: z.object({
  //   title: z.string().describe("The title of the Etsy listing"),
  //   description: z.string().describe("The description of the Etsy listing"),
  //   price: z.number().describe("The price of the Etsy listing"),
  //   currencyCode: z.string().describe("The currency code for the price"),
  //   images: z.array(z.string()).describe("URLs of images for the Etsy listing"),
  // }),
});