import type { ServerToolConfig } from "@/toolkits/types";
import type { getListing } from "./base";

export const getListingServerConfig: ServerToolConfig<
  typeof getListing.inputSchema.shape
  > = {
  callback: async ({ tokens, listingId }: { tokens: { access_tokens: string }, listingId: string }) => {
    const response = await fetch(
      `https://openapi.etsy.com/v3/application/listings/${listingId}`,
      {
        headers: {
          "x-api-key": process.env.AUTH_ETSY_ID || "",
          Authorization: `Bearer ${tokens.access_tokens}`
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch listing: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      title: data.title,
      description: data.description,
      price: data.price,
      currencyCode: data.currency_code,
      images: data.images.map((image: any) => ({
        url: image.url_170x135,
        fullUrl: image.url_fullxfull,
      })),
    };
  },
  message: (result) => 'Tool completed'
}