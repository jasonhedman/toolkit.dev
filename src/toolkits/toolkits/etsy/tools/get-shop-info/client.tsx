import {
  ExternalLink,
  Heart,
  Package,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";

import type { ClientToolConfig } from "@/toolkits/types";
import type { getShopInfo } from "./base";
import type React from "react";

export const getShopInfoClientConfig: ClientToolConfig<
  typeof getShopInfo.inputSchema.shape,
  typeof getShopInfo.outputSchema.shape
> = {
  CallComponent: ({ isPartial }) => (
    <div className="flex items-center gap-2">
      <Store className="h-4 w-4" />
      <span className="text-sm font-medium">Fetching Etsy shop info</span>
      {isPartial && <span className="animate-pulse">...</span>}
    </div>
  ),
  ResultComponent: ({ result: { shop } }) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="bg-muted rounded-md p-2">
          <Store className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">
            {shop.shop_name ?? "Etsy shop"}
          </h2>
          {shop.title && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {shop.title}
            </p>
          )}
          <div className="text-muted-foreground mt-1 text-xs">
            {shop.is_vacation ? "Vacation mode" : "Open"} /{" "}
            {shop.currency_code ?? "Currency unavailable"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <ShopMetric
          icon={Package}
          label="Active listings"
          value={formatCount(shop.listing_active_count)}
        />
        <ShopMetric
          icon={ShoppingBag}
          label="Sales"
          value={formatCount(shop.transaction_sold_count)}
        />
        <ShopMetric
          icon={Heart}
          label="Favorers"
          value={formatCount(shop.num_favorers)}
        />
        <ShopMetric
          icon={Star}
          label="Rating"
          value={formatRating(shop.review_average, shop.review_count)}
        />
      </div>

      {shop.url && (
        <a
          href={shop.url}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-1 text-sm font-medium"
        >
          Open shop
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  ),
};

const ShopMetric = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="bg-muted/50 rounded-md p-2">
    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="mt-1 font-medium">{value}</div>
  </div>
);

const formatCount = (value?: number | null) => value?.toLocaleString() ?? "0";

const formatRating = (rating?: number | null, count?: number | null) => {
  if (rating === undefined || rating === null) return "No reviews";

  const reviewCount = count?.toLocaleString() ?? "0";

  return `${rating.toFixed(1)} (${reviewCount})`;
};
