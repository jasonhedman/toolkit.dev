import { Etsy } from "etsy-ts";

import { createServerToolkit } from "../../create-toolkit";

import { api } from "@/trpc/server";

import { baseEtsyToolkitConfig } from "./base";

import { EtsyTools } from "./tools/tools";
import { EtsySecurityDataStorage } from "./security-data-storage";

import { getListingsServerConfig } from "@/toolkits/toolkits/etsy/tools/get-listings/server";
import { getShopInfoServerConfig } from "@/toolkits/toolkits/etsy/tools/get-shop-info/server";

export const etsyToolkitServer = createServerToolkit(
  baseEtsyToolkitConfig,
  "You have access to the Etsy toolkit for general account management. Currently, this toolkit provides:\n" +
    "- **Get Listings**: Retrieves all listings and their image URLs associated with the shop associated with the signed-in user.\n" +
    "- **Get Shop Info**: Retrieves the signed-in user's Etsy shop profile, status, and summary metrics.\n\n",
  async () => {
    const account = await api.accounts.getAccountByProvider("etsy");

    if (!account) {
      throw new Error("No Etsy account found");
    }
    if (!account.access_token) {
      throw new Error("No Etsy access token found");
    }

    const etsy = new Etsy({
      apiKey: process.env.AUTH_ETSY_ID!,
      securityDataStorage: new EtsySecurityDataStorage(),
      enableTokenRefresh: true,
    });

    return {
      [EtsyTools.getListings]: getListingsServerConfig(etsy),
      [EtsyTools.getShopInfo]: getShopInfoServerConfig(etsy),
    };
  },
);
