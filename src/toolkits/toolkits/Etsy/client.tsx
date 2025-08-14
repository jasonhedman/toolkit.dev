import { SiEtsy } from "@icons-pack/react-simple-icons";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { ToolkitGroups } from "@/toolkits/types";
import { baseEtsyToolkitConfig } from "./base";
import { EtsyWrapper } from "./wrapper";
import { Link } from "../components/link";
import { EtsyTools } from "./tools/tools";
import { getListingClientConfig } from "./tools/getListing/client";

export const etsyClientToolkit = createClientToolkit(
  baseEtsyToolkitConfig,
  {
    name: "Etsy Toolkit",
    description: "Etsy toolkit for fetching listing details.",
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
      }],
  },
  {
    [EtsyTools.getListing]: getListingClientConfig
  }
)