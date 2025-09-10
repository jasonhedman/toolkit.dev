import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { IShopListing } from "etsy-ts";

export const createDraftListing = createBaseTool({
  description:
    "Creates a new draft listing in the Etsy shop associated with the authenticated user." +
    "Requires input: quantity, title, description, price, who_made, when_made, is_supply, and taxonomy_id." +
    "Optional inputs include: (if not specified, the default value is null" +
    "shipping_profile_id — ID of the shipping profile to associate with the listing. REQUIRED if listing type is physical." +
    "return_policy_id - the numeric ID of the Return Policy." +
    "materials - A list of material strings for materials used in the product. Valid materials strings contain only letters, numbers, and whitespace characters. (regex: /[^\\p{L}\\p{Nd}\\p{Zs}]/u)." +
    "shop_section_id - The numeric ID of the shop section for this listing." +
    "processing_min - The minimum number of days it takes to produce the item." +
    "processing_max - The maximum number of days it takes to produce the item." +
    "readiness_state_id - The numeric ID of the processing profile associated with the listing. Required when type is physical." +
    "tags - A comma-separated list of tag strings for the listing. When creating or updating a listing, valid tag strings contain only letters, numbers, whitespace characters, -, ', ™, ©, and ®. (regex: /[^\\p{L}\\p{Nd}\\p{Zs}-'™©®]/u)." +
    'styles - An array of style strings for this listing, each of which is free-form text string such as "Formal", or "Steampunk". When creating or updating a listing, the listing may have up to two styles. Valid style strings contain only letters, numbers, and whitespace characters. (regex: /[^\\p{L}\\p{Nd}\\p{Zs}]/u).' +
    "item_weight - The numeric weight of the product measured in units set in 'item_weight_unit'. If set, the values must be greater than 0." +
    "item_length - The numeric length of the product measured in units set in 'item_dimensions_unit'. If set, the values must be greater than 0." +
    "item_width - The numeric width of the product measured in units set in 'item_dimensions_unit'. If set, the values must be greater than 0." +
    "item_height - The numeric height of the product measured in units set in 'item_dimensions_unit'. If set, the values must be greater than 0." +
    "item_weight_unit - The unit of measurement for the weight of the product. Valid values are 'g' (grams), 'kg' (kilograms), 'oz' (ounces), and 'lb' (pounds). Required if 'item_weight' is provided." +
    "item_dimensions_unit - The unit of measurement for the dimensions of the product. Valid values are 'mm' (millimeters), 'cm' (centimeters), 'm' (meters), 'in' (inches), and 'ft' (feet). Required if any of 'item_length', 'item_width', or 'item_height' is provided." +
    "is_personalizable - When ture, indicates that the listing is personalizable." +
    "personalization_is_required - When true, indicates that personalization is required for the listing. Will only change if _is_personalizable is true" +
    "personalization_char_count_max - The maximum number of characters allowed for personalization. Will only change if _is_personalizable is true." +
    "personalization_instructions - Instructions for personalization. Will only change if _is_personalizable is true." +
    "production_partner_ids - An array of unique IDs of production partner ids." +
    "image_ids - An array of numeric image IDs of the images in a listing, which can include up to 10 images." +
    "is_customizable - When true, a buyer may contact the seller for a customized order. The default value is true when a shop accepts custom orders. Does not apply to shops that do not accept custom orders." +
    "should_auto_renew - When true, renews a listing for four months upon expiration." +
    "is_taxable - When true, applicable shop tax rates apply to this listing at checkout" +
    "type - An enumerated type string that indicates whether the listing is physical or a digital download or both.",
  inputSchema: z.object({
    title: z
      .string()
      .min(1)
      .max(140)
      .describe(
        "The title of the listing. Can only contain letters, numbers, punctuation marks, mathematical symbols, whitespace characters",
      ),
    description: z
      .string()
      .min(1)
      .max(1000)
      .describe("The description of the listing."),
    price: z
      .number()
      .positive()
      .describe(
        "The price of the item. Must be a positive value with up to two decimal places.",
      ),
    quantity: z
      .number()
      .min(1)
      .describe(
        "The quantity of items available in this listing. Must be at least 1.",
      ),
    who_made: z
      .enum(["i_did", "collective", "someone_else"])
      .describe("Who made the item."),
    when_made: z
      .enum([
        "made_to_order",
        "2020_2025",
        "2010_2019",
        "2006_2009",
        "before_2006",
        "2000_2005",
        "1990s",
        "1980s",
        "1970s",
        "1960s",
        "1950s",
        "1940s",
        "1930s",
        "1920s",
        "1910s",
        "1900s",
        "1800s",
        "1700s",
        "before_1700",
      ])
      .describe(
        "An enumerated string for the era in which the maker made the product in this listing. Helps buyers locate the listing under the Vintage heading.",
      ),
    taxonomy_id: z
      .number()
      .int()
      .positive()
      .describe("The taxonomy ID for the category of the listing."),
    is_supply: z
      .boolean()
      .describe(
        "When true, tags the listing as a supply product, else indicates that it's a finished product.",
      ),
    shipping_profile_id: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        "ID of the shipping profile to associate with the listing. REQUIRED if listing type is physical.",
      ),
    return_policy_id: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("The numeric ID of the Return Policy."),
    materials: z
      .array(
        z
          .string()
          .regex(/[^\p{L}\p{Nd}\p{Zs}]/u, {
            message:
              "Valid materials strings contain only letters, numbers, and whitespace characters.",
          })
          .min(1)
          .max(25)
          .describe(
            "A material string for materials used in the product. Valid materials strings contain only letters, numbers, and whitespace characters.",
          ),
      )
      .max(25),
    shop_section_id: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("The numeric ID of the shop section for this listing."),
    processing_min: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("The minimum number of days it takes to produce the item."),
    processing_max: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("The maximum number of days it takes to produce the item."),
    readiness_state_id: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        "The numeric ID of the processing profile associated with the listing. Required when type is physical.",
      ),
    tags: z
      .array(
        z
          .string()
          .regex(/^[\p{L}\p{Nd}\p{Zs}'™©®-]+$/u, {
            message:
              "Valid tag strings contain only letters, numbers, whitespace characters, -, ', ™, ©, and ®.",
          })
          .min(1)
          .max(25)
          .describe(
            "A tag string for the listing. When creating or updating a listing, valid tag strings contain only letters, numbers, whitespace characters, -, ', ™, ©, and ®.",
          ),
      )
      .max(13)
      .describe("A list of tag strings for the listing."),
    styles: z
      .array(
        z
          .string()
          .regex(/[^\p{L}\p{Nd}\p{Zs}]/u, {
            message:
              "Valid style strings contain only letters, numbers, and whitespace characters.",
          })
          .min(1)
          .max(25)
          .describe(
            'A style string for this listing, such as "Formal", or "Steampunk". When creating or updating a listing, the listing may have up to two styles. Valid style strings contain only letters, numbers, and whitespace characters.',
          ),
      )
      .max(2)
      .describe("An array of style strings for this listing."),
    item_weight: z
      .number()
      .positive()
      .optional()
      .describe(
        "The numeric weight of the product measured in units set in 'item_weight_unit'. If set, the values must be greater than 0.",
      ),
    item_length: z
      .number()
      .positive()
      .optional()
      .describe(
        "The numeric length of the product measured in units set in 'item_dimensions_unit'. If set, the values must be greater than 0.",
      ),
    item_width: z
      .number()
      .positive()
      .optional()
      .describe(
        "The numeric width of the product measured in units set in 'item_dimensions_unit'. If set, the values must be greater than 0.",
      ),
    item_height: z
      .number()
      .positive()
      .optional()
      .describe(
        "The numeric height of the product measured in units set in 'item_dimensions_unit'. If set, the values must be greater than 0.",
      ),
    item_weight_unit: z
      .enum(["g", "kg", "oz", "lb"])
      .optional()
      .describe(
        "The unit of measurement for the weight of the product. Valid values are 'g' (grams), 'kg' (kilograms), 'oz' (ounces), and 'lb' (pounds). Required if 'item_weight' is provided.",
      ),
    item_dimensions_unit: z
      .enum(["mm", "cm", "m", "in", "ft"])
      .optional()
      .describe(
        "The unit of measurement for the dimensions of the product. Valid values are 'mm' (millimeters), 'cm' (centimeters), 'm' (meters), 'in' (inches), and 'ft' (feet). Required if any of 'item_length', 'item_width', or 'item_height' is provided.",
      ),
    is_personalizable: z
      .boolean()
      .optional()
      .describe("When true, indicates that the listing is personalizable."),
    personalization_is_required: z
      .boolean()
      .optional()
      .describe(
        "When true, indicates that personalization is required for the listing. Will only change if _is_personalizable is true",
      ),
    personalization_char_count_max: z
      .number()
      .int()
      .min(1)
      .max(250)
      .optional()
      .describe(
        "The maximum number of characters allowed for personalization. Will only change if _is_personalizable is true.",
      ),
    personalization_instructions: z
      .string()
      .max(500)
      .optional()
      .describe(
        "Instructions for personalization. Will only change if _is_personalizable is true.",
      ),
    production_partner_ids: z
      .array(
        z
          .number()
          .int()
          .positive()
          .describe("A unique ID of a production partner."),
      )
      .optional()
      .describe("An array of unique IDs of production partner ids."),
    image_ids: z
      .array(
        z
          .number()
          .int()
          .positive()
          .describe("A numeric image ID of an image in a listing."),
      )
      .max(10)
      .optional()
      .describe(
        "An array of numeric image IDs of the images in a listing, which can include up to 10 images.",
      ),
    is_customizable: z
      .boolean()
      .optional()
      .describe(
        "When true, a buyer may contact the seller for a customized order. The default value is true when a shop accepts custom orders. Does not apply to shops that do not accept custom orders.",
      ),
    should_auto_renew: z
      .boolean()
      .optional()
      .describe("When true, renews a listing for four months upon expiration."),
    is_taxable: z
      .boolean()
      .optional()
      .describe(
        "When true, applicable shop tax rates apply to this listing at checkout",
      ),
    type: z
      .enum(["physical", "download", "both"])
      .describe(
        "An enumerated type string that indicates whether the listing is physical or a digital download or both.",
      ),
  }),
  outputSchema: z.object({
    result: z.custom<IShopListing>(),
  }),
});
