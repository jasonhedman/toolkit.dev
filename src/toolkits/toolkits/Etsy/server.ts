import { createServerToolkit } from "../../create-toolkit";
import { baseEtsyToolkitConfig } from "./base";
import { EtsyTools } from "./tools/tools";
import { getListingServerConfig } from "./tools/getListing/server";
import { api } from "@/trpc/server";
import { env } from "@/env";
import { Etsy } from 'etsy-ts'
export const etsyToolkitServer = createServerToolkit(
  baseEtsyToolkitConfig,
  'You have access to the Etsy toolkit for general account management. Currently, this toolkit provides:\n' +
  '- **Get Listings**: Retrieves all listings associated with the shop associated with the signed-in user.\n\n',
  async () => {
    const account = await api.accounts.getAccountByProvider("etsy");

    if (!account) {
      throw new Error("No Etsy account found");
    }
    if (!account.access_token) {
      throw new Error("No Etsy access token found");
    }

    const etsy = new Etsy({
      apiKey: env.AUTH_ETSY_ID,
      // TODO:: workaround for ISecurityDataStorage
    });

    return {
      [EtsyTools.getListing]: getListingServerConfig(etsy)
      };
    }
);