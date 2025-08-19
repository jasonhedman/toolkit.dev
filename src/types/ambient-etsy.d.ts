// Temporary ambient declarations for etsy-ts until proper upstream types / correct export names are confirmed.
// TODO: Replace with actual exported types from the etsy-ts package once verified to avoid masking underlying SDK shapes.

declare module "etsy-ts" {
  export interface Tokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number; // seconds
  }
  export interface SecurityDataFilter {
    etsyUserId: number | string;
  }
  export interface ISecurityDataStorage {
    storeAccessToken(filter: SecurityDataFilter, accessToken: Tokens): Promise<void>;
    findAccessToken(): Promise<Tokens | undefined>;
  }
  export interface IListing {
    listing_id: number | string;
    title?: string;
    url?: string;
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
  // Fallback for IShopListing usage (alias to IListing)
  export type IShopListing = IListing;

  export class Etsy {
    constructor(opts: {
      apiKey: string;
      securityDataStorage: ISecurityDataStorage;
      enableTokenRefresh?: boolean;
    });
    User: { getMe(): Promise<{ data: { user_id?: number | string } }> };
    Shop: { getShopByOwnerUserId(userId: number | string): Promise<{ data: { shop_id?: number | string } }> };
    ShopListing: { getFeaturedListingsByShop(args: { shopId: number | string }): Promise<{ data: { results?: IListing[] } }> };
  }
}
