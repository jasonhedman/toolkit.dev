import { createServerToolkit } from "../../create-toolkit";
import { baseEtsyToolkitConfig } from "./base";
import { EtsyTools } from "./tools/tools";
import { getListingServerConfig } from "./tools/getListing/server";
import { api } from "@/trpc/server";
import { env } from "@/env";
import EtsyProvider from "@/server/auth/custom-providers/etsy";

export const etsyToolkitServer = createServerToolkit(
  baseEtsyToolkitConfig,
  'You have access to the Etsy toolkit for general account management. Currently, this toolkit provides:\n' +
  '- **Get Listing**: Retrieve detailed information about a specific Etsy listing using its ID.\n\n'
  async () => {
  }
);