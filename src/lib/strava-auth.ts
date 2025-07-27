import { db } from "@/server/db";
import { env } from "@/env";

export interface StravaTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  scope: string;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

export interface StravaApiHeaders {
  Authorization: string;
  'Content-Type': string;
}

/**
 * Secure token management for Strava OAuth
 */
export class StravaTokenManager {
  private static readonly STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
  private static readonly STRAVA_API_BASE = 'https://www.strava.com/api/v3';

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<StravaTokenData> {
    const tokenParams = new URLSearchParams({
      client_id: env.AUTH_STRAVA_ID,
      client_secret: env.AUTH_STRAVA_SECRET,
      code: code,
      grant_type: "authorization_code",
    });

    const response = await fetch(this.STRAVA_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenParams,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenData: StravaTokenData = await response.json();
    
    // Validate required fields
    if (!tokenData.access_token || !tokenData.refresh_token) {
      throw new Error('Invalid token response: missing access_token or refresh_token');
    }

    return tokenData;
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<StravaTokenData> {
    const tokenParams = new URLSearchParams({
      client_id: env.AUTH_STRAVA_ID,
      client_secret: env.AUTH_STRAVA_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(this.STRAVA_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenParams,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenData: StravaTokenData = await response.json();
    
    if (!tokenData.access_token) {
      throw new Error('Invalid refresh response: missing access_token');
    }

    return tokenData;
  }

  /**
   * Get valid access token for user, refreshing if necessary
   */
  static async getValidAccessToken(userId: string): Promise<string> {
    const account = await db.account.findFirst({
      where: {
        userId: userId,
        provider: "strava",
      },
    });

    if (!account) {
      throw new Error("No Strava account found for user");
    }

    if (!account.access_token) {
      throw new Error("No access token found");
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = account.expires_at || 0;
    const bufferTime = 5 * 60; // 5 minutes

    if (now >= (expiresAt - bufferTime)) {
      // Token is expired or will expire soon, refresh it
      if (!account.refresh_token) {
        throw new Error("Token expired and no refresh token available");
      }

      try {
        const newTokenData = await this.refreshAccessToken(account.refresh_token);
        
        // Update the account with new tokens
        await db.account.update({
          where: { id: account.id },
          data: {
            access_token: newTokenData.access_token,
            refresh_token: newTokenData.refresh_token || account.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + newTokenData.expires_in,
            token_type: newTokenData.token_type,
            scope: newTokenData.scope,
          },
        });

        return newTokenData.access_token;
      } catch (error) {
        // If refresh fails, mark account as invalid
        await db.account.update({
          where: { id: account.id },
          data: {
            access_token: null,
            refresh_token: null,
            expires_at: null,
          },
        });
        throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return account.access_token;
  }

  /**
   * Create API headers with valid access token
   */
  static async createApiHeaders(userId: string): Promise<StravaApiHeaders> {
    const accessToken = await this.getValidAccessToken(userId);
    
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Validate state parameter for CSRF protection
   */
  static validateState(state: string | null, expectedRedirect?: string): boolean {
    if (!state) {
      return false;
    }

    try {
      const stateParams = new URLSearchParams(state);
      const redirectParam = stateParams.get("redirect");
      
      // Basic validation - ensure state contains expected redirect
      if (expectedRedirect && redirectParam) {
        const decodedRedirect = decodeURIComponent(redirectParam);
        return decodedRedirect.includes(expectedRedirect);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate secure state parameter
   */
  static generateState(redirectUrl: string): string {
    const stateParams = new URLSearchParams();
    stateParams.set("redirect", encodeURIComponent(redirectUrl));
    stateParams.set("timestamp", Date.now().toString());
    return stateParams.toString();
  }

  /**
   * Revoke access token (for logout/disconnect)
   */
  static async revokeAccess(userId: string): Promise<void> {
    const account = await db.account.findFirst({
      where: {
        userId: userId,
        provider: "strava",
      },
    });

    if (!account?.access_token) {
      return; // Already revoked or doesn't exist
    }

    try {
      // Revoke token with Strava
      await fetch(`${this.STRAVA_API_BASE}/oauth/deauthorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: account.access_token,
        }),
      });
    } catch (error) {
      // Log error but don't fail - token will be invalid anyway
      console.error("Failed to revoke Strava token:", error);
    }

    // Clear tokens from database
    await db.account.update({
      where: { id: account.id },
      data: {
        access_token: null,
        refresh_token: null,
        expires_at: null,
      },
    });
  }
} 