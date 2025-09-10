import { SiEtsy } from "@icons-pack/react-simple-icons";

import { EtsyWrapper } from "./wrapper";

import { Link } from "../components/link";

import { baseEtsyToolkitConfig } from "./base";

import { createClientToolkit } from "@/toolkits/create-toolkit";

import { getListingsClientConfig } from "@/toolkits/toolkits/etsy/tools/get-listings/client";

import { createDraftListingClientConfig } from "@/toolkits/toolkits/etsy/tools/create-draft-listing/client";

import { ToolkitGroups } from "@/toolkits/types";
import { EtsyTools } from "./tools/tools";

export const etsyClientToolkit = createClientToolkit(
  baseEtsyToolkitConfig,
  {
    name: "Etsy Toolkit",
    description:
      "Etsy toolkit for Listing management, Payment management, Receipt management, Shipping management, Shop management and more!",
    icon: SiEtsy,
    form: null,
    type: ToolkitGroups.DataSource,
    Wrapper: EtsyWrapper,
    envVars: [
      {
        type: "all",
        keys: ["AUTH_ETSY_ID"],
        description: (
          <span>
            Create a Etsy OAuth application{" "}
            <Link href="https://www.etsy.com/developers">here</Link>
          </span>
        ),
      },
    ],
  },
  {
    [EtsyTools.getListings]: getListingsClientConfig,
    [EtsyTools.createDraftListing]: createDraftListingClientConfig,
  },
);
