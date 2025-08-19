import type { ServerToolConfig } from "@/toolkits/types";
import type { getListings } from "./base";

interface EtsyClientSubset {
  User: { getMe: () => Promise<{ data: { user_id?: number } }> };
  Shop: { getShopByOwnerUserId: (userId: number) => Promise<{ data: { shop_id?: number } }> };
  ShopListing: { getFeaturedListingsByShop: (args: { shopId: number }) => Promise<{ data: { results?: unknown[] } }> };
}

export const getListingsServerConfig = (
  etsy: unknown,
): ServerToolConfig<
  typeof getListings.inputSchema.shape,
  typeof getListings.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const client = etsy as EtsyClientSubset;
        const user = await client.User.getMe();

        const userId = user.data.user_id;

        if (!userId) throw new Error("Missing Etsy user ID");

  const shop = await client.Shop.getShopByOwnerUserId(userId);

        const shopId = shop.data.shop_id;

        if (!shopId) throw new Error("Missing Etsy shop ID");

  const listings = await client.ShopListing.getFeaturedListingsByShop({
          shopId,
        });

  if (!listings.data.results) throw new Error("Missing Etsy listings");
  const results = listings.data.results as { listing_id: number | string }[];
  return { results };
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
