import { PrismaAdapter } from "@auth/prisma-adapter";

import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";

import { providers } from "./providers";

import { db } from "@/server/db";

import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import { IS_DEVELOPMENT } from "@/lib/constants";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers,
  adapter: PrismaAdapter(db),
  pages: {
    newUser: IS_DEVELOPMENT ? "/" : "/?welcome=true",
    signOut: "/",
  },
  trustHost: true,
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    async signIn({ account }) {
      if (account) {
        const existingAccount = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });

        if (!existingAccount) {
          return true;
        }

        // Update account with new tokens and scopes if they've changed
        await db.account.update({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            scope: account.scope,
            token_type: account.token_type,
            expires_at: account.expires_at,
          },
        });
      }
      return true;
    },
    async jwt({ token, account }) {
      if (
        account?.provider === "siwe-csrf" ||
        (account?.provider === "guest" && IS_DEVELOPMENT)
      ) {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await db.session.create({
          data: {
            id: sessionToken,
            sessionToken: sessionToken,
            userId: params.token.sub,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
} satisfies NextAuthConfig;
