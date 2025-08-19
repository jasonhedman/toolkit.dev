import { createServerToolkit } from "../../create-toolkit";

import { api } from "@/trpc/server";

import { baseEtsyToolkitConfig } from "./base";

import { EtsyTools } from "./tools/tools";
import { EtsySecurityDataStorage } from "./security-data-storage";

import { getListingsServerConfig } from "@/toolkits/toolkits/etsy/tools/get-listings/server";

export const etsyToolkitServer = createServerToolkit(
  baseEtsyToolkitConfig,
  "You have access to the Etsy toolkit for general account management. Currently, this toolkit provides:\n" +
    "- **Get Listings**: Retrieves all listings and their image URLs associated with the shop associated with the signed-in user.\n\n",
  async () => {
    const account = await api.accounts.getAccountByProvider("etsy");

    if (!account) {
      throw new Error("No Etsy account found");
    }
    if (!account.access_token) {
      throw new Error("No Etsy access token found");
    }

  // Dynamically import etsy-ts only if credentials present to avoid build-time type issues.
    if (!process.env.AUTH_ETSY_ID) {
      throw new Error("Missing AUTH_ETSY_ID for Etsy toolkit usage");
    }
  interface EtsyModuleCandidate { Etsy?: new (...args: any[]) => unknown; default?: new (...args: any[]) => unknown } // eslint-disable-line @typescript-eslint/no-explicit-any
    let etsyInstance: unknown;
    try {
      const rawMod = await import("etsy-ts");
      const mod = rawMod as unknown as EtsyModuleCandidate; // cast via unknown to satisfy TS overlap concerns
      const EtsyCtor = mod.Etsy ?? mod.default;
      if (!EtsyCtor || typeof EtsyCtor !== "function") {
        throw new Error("Etsy constructor not found in module");
      }
	etsyInstance = new EtsyCtor({
        apiKey: process.env.AUTH_ETSY_ID,
        securityDataStorage: new EtsySecurityDataStorage(),
        enableTokenRefresh: true,
      });
    } catch (e) {
      throw new Error("Failed to load etsy-ts module: " + (e instanceof Error ? e.message : String(e)));
    }

    return {
      [EtsyTools.getListings]: getListingsServerConfig(etsyInstance),
    };
  },
);
