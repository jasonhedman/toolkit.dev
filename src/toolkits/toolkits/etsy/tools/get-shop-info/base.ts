import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

import type { IShop } from "etsy-ts";

export const getShopInfo = createBaseTool({
  description:
    "Fetches the Etsy shop profile and summary metrics for the authenticated user.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    shop: z.custom<IShop>(),
  }),
});
