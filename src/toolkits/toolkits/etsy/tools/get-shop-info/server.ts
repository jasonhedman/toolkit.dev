import type { Etsy } from "etsy-ts";

import type { ServerToolConfig } from "@/toolkits/types";
import type { getShopInfo } from "./base";

export const getShopInfoServerConfig = (
  etsy: Etsy,
): ServerToolConfig<
  typeof getShopInfo.inputSchema.shape,
  typeof getShopInfo.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const user = await etsy.User.getMe();
        const userId = user.data.user_id;

        if (!userId) throw new Error("Missing Etsy user ID");

        const shop = await etsy.Shop.getShopByOwnerUserId(userId);

        if (!shop.data.shop_id) throw new Error("Missing Etsy shop ID");

        return {
          shop: shop.data,
        };
      } catch (error) {
        console.error("Etsy API error:", error);
        throw new Error("Failed to fetch shop info from Etsy");
      }
    },
    message:
      "Successfully retrieved the Etsy shop info. The user is shown the response in the UI. Do not reiterate it. " +
      "If you called this tool because the user asked a question, answer the question.",
  };
};
