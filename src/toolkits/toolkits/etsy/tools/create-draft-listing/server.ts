import type { Etsy, ICreateDraftListingPayload } from "etsy-ts";

import type { ServerToolConfig } from "@/toolkits/types";
import type { createDraftListing } from "./base";

export const createDraftListingServerConfig = (
  etsy: Etsy,
  userId: string,
): ServerToolConfig<
  typeof createDraftListing.inputSchema.shape,
  typeof createDraftListing.outputSchema.shape
> => {
  return {
    callback: async ({
      title,
      description,
      price,
      quantity,
      who_made,
      is_supply,
      when_made,
      taxonomy_id,
      shipping_profile_id,
      shop_section_id,
      materials,
      return_policy_id,
      processing_min,
      processing_max,
      readiness_state_id,
      tags,
      styles,
      item_weight,
      item_weight_unit,
      item_length,
      item_width,
      item_height,
      item_dimensions_unit,
      is_personalizable,
      personalization_is_required,
      personalization_char_count_max,
      personalization_instructions,
      production_partner_ids,
      image_ids,
      is_customizable,
      should_auto_renew,
      is_taxable,
      type,
    }) => {
      try {
        const shop = await etsy.Shop.getShopByOwnerUserId(Number(userId));

        const shopId = shop.data.shop_id;

        if (!shopId) throw new Error("Missing Etsy shop ID");

        const params: ICreateDraftListingPayload = {
          title,
          description,
          price,
          quantity,
          who_made,
          is_supply,
          when_made,
          taxonomy_id,
          materials,
          type,
          styles,
          ...(shipping_profile_id !== undefined ? { shipping_profile_id } : {}),
          ...(shop_section_id !== undefined ? { shop_section_id } : {}),
          ...(return_policy_id !== undefined ? { return_policy_id } : {}),
          ...(processing_min !== undefined ? { processing_min } : {}),
          ...(processing_max !== undefined ? { processing_max } : {}),
          ...(readiness_state_id !== undefined ? { readiness_state_id } : {}),
          ...(item_weight !== undefined ? { item_weight } : {}),
          ...(item_weight_unit !== undefined ? { item_weight_unit } : {}),
          ...(item_length !== undefined ? { item_length } : {}),
          ...(item_width !== undefined ? { item_width } : {}),
          ...(item_height !== undefined ? { item_height } : {}),
          ...(item_dimensions_unit !== undefined
            ? { item_dimensions_unit }
            : {}),
          ...(is_personalizable !== undefined ? { is_personalizable } : {}),
          ...(personalization_is_required !== undefined
            ? { personalization_is_required }
            : {}),
          ...(personalization_char_count_max !== undefined
            ? { personalization_char_count_max }
            : {}),
          ...(personalization_instructions !== undefined
            ? { personalization_instructions }
            : {}),
          ...(production_partner_ids !== undefined
            ? { production_partner_ids }
            : {}),
          ...(image_ids !== undefined ? { image_ids } : {}),
          ...(is_customizable !== undefined ? { is_customizable } : {}),
          ...(should_auto_renew !== undefined ? { should_auto_renew } : {}),
          ...(is_taxable !== undefined ? { is_taxable } : {}),
          ...(tags !== undefined ? { tags } : {}),
          ...(type !== undefined ? { type } : {}),
        };

        const listing = await etsy.ShopListing.createDraftListing(
          { shopId },
          params,
          undefined,
        );

        if (!listing.data) throw new Error("Missing Etsy listing");

        return {
          result: listing.data,
        };
      } catch (error) {
        console.error("Etsy API error:", error);
        throw new Error("Failed to create draft listing on Etsy");
      }
    },
    message:
      "Successfully created the Etsy draft listing. The user is shown the responses in the UI. Do not reiterate them. " +
      "If you called this tool because the user asked a question, answer the question.",
  };
};
