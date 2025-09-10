import { Etsy } from "etsy-ts";

import { createServerToolkit } from "../../create-toolkit";

import { api } from "@/trpc/server";

import { baseEtsyToolkitConfig } from "./base";

import { EtsyTools } from "./tools/tools";
import { EtsySecurityDataStorage } from "./security-data-storage";

import { getListingsServerConfig } from "@/toolkits/toolkits/etsy/tools/get-listings/server";
import { createDraftListingServerConfig } from "@/toolkits/toolkits/etsy/tools/create-draft-listing/server";

export const etsyToolkitServer = createServerToolkit(
  baseEtsyToolkitConfig,
  "You have access to the Etsy toolkit for general account management. Currently, this toolkit provides:\n" +
    "- **Get Listings By Shop**: Retrieves listings associated with the shop owned by authenticated user. Has the ability to fetch associations relating to each listing as well.\n" +
    "- **Create Draft Listing**: Creates a new draft listing in the shop owned by authenticated user. Accepts a variety of inputs to assign to listing.\n",
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
      [EtsyTools.getListings]: getListingsServerConfig(
        etsy,
        account.providerAccountId,
      ),
      [EtsyTools.createDraftListing]: createDraftListingServerConfig(
        etsy,
        account.providerAccountId,
      ),
    };
  },
);
