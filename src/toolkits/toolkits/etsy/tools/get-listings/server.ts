import type { Etsy, IGetListingsByShopParams } from "etsy-ts";

import type { ServerToolConfig } from "@/toolkits/types";
import type { getListings } from "./base";

export const getListingsServerConfig = (
  etsy: Etsy,
  userId: string,
): ServerToolConfig<
  typeof getListings.inputSchema.shape,
  typeof getListings.outputSchema.shape
> => {
  return {
    callback: async ({ limit, offset, sort_on, sort_order, includes }) => {
      try {
        const shop = await etsy.Shop.getShopByOwnerUserId(Number(userId));

        const shopId = shop.data.shop_id;

        if (!shopId) throw new Error("Missing Etsy shop ID");

        const params: IGetListingsByShopParams = {
          shopId,
          ...(limit !== undefined ? { limit } : {}),
          ...(offset !== undefined ? { offset } : {}),
          ...(sort_on !== undefined ? { sort_on } : {}),
          ...(sort_order !== undefined ? { sort_order } : {}),
          ...(includes !== undefined ? { includes } : {}),
        };

        const listings = await etsy.ShopListing.getListingsByShop(params);

        if (!listings.data.results) throw new Error("Missing Etsy listings");

        return {
          results: listings.data.results,
        };
      } catch (error) {
        console.error("Etsy API error:", error);
        throw new Error("Failed to fetch listings from Etsy");
      }
    },
    message:
      "Successfully retrieved the Etsy listing. The user is shown the responses in the UI. Do not reiterate them. " +
      "If you called this tool because the user asked a question, answer the question.",
  };
};
