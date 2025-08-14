import { env } from "@/env";
import type { OAuth2Config, OAuthUserConfig } from "@auth/core/providers";

export interface EtsyProfile {
  user_id: number; // The numeric ID of a user. Also a valid shop ID.
  primary_email?: string | null; // The user's primary email address (nullable).
  first_name?: string | null; // The user's first name (nullable).
  last_name?: string | null; // The user's last name (nullable).
  image_url_75x75?: string | null; // The user's avatar URL (nullable).
}

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
        scope: "email_r",
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

        const user = (await response.json()) as EtsyProfile;

        return user;
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
