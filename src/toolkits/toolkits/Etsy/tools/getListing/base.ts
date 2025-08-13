import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import { ShopListing } from "etsy-ts/dist/api/ShopListing";

export const getListing = createBaseTool({
  description: "Get details about an Etsy listing",
  inputSchema: z.object({
  }),
  outputSchema: z.object({
    listings: z.array(z.custom<ShopListing>())
  })
  // outputSchema: z.object({
  //   title: z.string().describe("The title of the Etsy listing"),
  //   description: z.string().describe("The description of the Etsy listing"),
  //   price: z.number().describe("The price of the Etsy listing"),
  //   currencyCode: z.string().describe("The currency code for the price"),
  //   images: z.array(z.string()).describe("URLs of images for the Etsy listing"),
  // }),
});