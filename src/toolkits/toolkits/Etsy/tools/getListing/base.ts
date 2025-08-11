import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getListing = createBaseTool({
  description: "Get details about an Etsy listing",
  inputSchema: z.object({
    tokens: z.object({access_tokens: z.string()}).describe("Etsy authorization token"),
    listingId: z.string().describe("The ID of the Etsy listing to query"),
  }),
  outputSchema: z.object({
    title: z.string().describe("The title of the Etsy listing"),
    description: z.string().describe("The description of the Etsy listing"),
    price: z.number().describe("The price of the Etsy listing"),
    currencyCode: z.string().describe("The currency code for the price"),
    images: z.array(z.string()).describe("URLs of images for the Etsy listing"),
  }),
});