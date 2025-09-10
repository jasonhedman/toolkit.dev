import { env } from "@/env";

import type { OAuth2Config, OAuthUserConfig } from "next-auth/providers";

export interface EtsyProfile {
  user_id: number;
  primary_email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url_75x75?: string | null;
}

export const etsyScopes =
  "address_r address_w billing_r cart_r cart_w email_r favorites_r favorites_w feedback_r listings_d listings_r listings_w profile_r profile_w recommend_r recommend_w shops_r shops_w transactions_r transactions_w";

export default function EtsyProvider<P extends EtsyProfile>(
  options: OAuthUserConfig<P>,
): OAuth2Config<P> {
  return {
    id: "etsy",
    name: "Etsy",
    type: "oauth",
    clientId: options.clientId,
    clientSecret: options.clientId,
    authorization: {
      url: "https://www.etsy.com/oauth/connect",
      params: {
        scope: etsyScopes,
        state: Math.random().toString(36).substring(2, 15),
      },
    },
    token: {
      url: "https://openapi.etsy.com/v3/public/oauth/token",
      params: {
        client_id: env.AUTH_ETSY_ID,
      },
    },
    client: { token_endpoint_auth_method: "none" },
    userinfo: {
      url: "https://openapi.etsy.com/v3/application/users/me",
      async request({ tokens }: { tokens: { access_token: string } }) {
        const userId = parseInt(tokens.access_token.split(".")[0]!);

        const response = await fetch(
          `https://api.etsy.com/v3/application/users/${userId}`,
          {
            headers: {
              "x-api-key": env.AUTH_ETSY_ID,
              Authorization: `Bearer ${tokens.access_token}`,
            },
          },
        );

        return (await response.json()) as EtsyProfile;
      },
    },
    profile(profile) {
      return {
        id: profile.user_id.toString(),
        name: profile.first_name,
        email: profile.primary_email,
        image: profile.image_url_75x75,
      };
    },
    options,
  };
}
