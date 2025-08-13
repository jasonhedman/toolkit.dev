import type { ServerToolConfig } from "@/toolkits/types";
import type { getListing } from "./base";
import type { Etsy } from "etsy-ts";
import { api } from "@/trpc/server";


export const getListingServerConfig = (
  etsy: Etsy
  ): ServerToolConfig<
  typeof getListing.inputSchema.shape,
  typeof getListing.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const account = await api.accounts.getAccountByProvider("etsy");
        const userID = account?.providerAccountId;
        const etsyUserId = Number(userID);


        const shop = await etsy.Shop.getShopByOwnerUserId(etsyUserId, {etsyUserId});
        const shopId = shop.data.shop_id;
        if (typeof shopId !== "number") {
          throw new Error("shop_id is undefined");
        }
        const listings = await etsy.ShopListing.getListingsByShop({ shopId: shopId }, { etsyUserId });
        return {
          listings: listings.data,
        };
      } catch (error) {
        console.error("Etsy API error:", error);
        throw new Error("Failed to fetch listings from Etsy");
      }
    },
    message:
      "Successfully retrieved the Etsy listing. The user is shown the responses in the UI. Do not reiterate them. The user is shown the responses in the UI. " +
      "If you called this tool because the user asked a question, answer the question.",
  };
};