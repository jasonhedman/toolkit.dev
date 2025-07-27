import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { StravaTokenManager } from "@/lib/strava-auth";
import { RateLimiter } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = RateLimiter.checkRateLimit(request, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
  
  if (!rateLimit.allowed) {
    console.error("🚴 Rate limit exceeded for Strava OAuth");
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=rate_limit_exceeded`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Log minimal info for debugging (no sensitive data)
  console.log("🚴 Strava OAuth callback received");

  if (error) {
    console.error("🚴 Strava OAuth error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_auth_failed`);
  }

  if (!code) {
    console.error("🚴 No authorization code received");
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_no_code`);
  }

  try {
    // Get the current session
    const session = await auth();
    if (!session?.user?.id) {
      console.error("🚴 No valid session found");
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=session_required`);
    }

    // Validate state parameter for CSRF protection
    if (!StravaTokenManager.validateState(state, process.env.NEXTAUTH_URL)) {
      console.error("🚴 Invalid state parameter");
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_invalid_state`);
    }

    console.log("🚴 Exchanging authorization code for tokens...");
    
    // Exchange authorization code for access token using secure token manager
    const tokenData = await StravaTokenManager.exchangeCodeForToken(code);

    console.log("🚴 Token exchange successful");

    // Save the Strava account to the database
    const existingAccount = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "strava",
      },
    });

    if (existingAccount) {
      // Update existing account
      await db.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
          providerAccountId: tokenData.athlete.id.toString(),
        },
      });
      console.log("🚴 Updated existing Strava account");
    } else {
      // Create new account
      await db.account.create({
        data: {
          userId: session.user.id,
          type: "oauth",
          provider: "strava",
          providerAccountId: tokenData.athlete.id.toString(),
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
        },
      });
      console.log("🚴 Created new Strava account");
    }

    console.log("🚴 Strava authentication completed successfully!");
    
    // Handle redirect from state parameter
    let redirectUrl = `${process.env.NEXTAUTH_URL}/?strava_connected=true`;
    if (state) {
      try {
        const stateParams = new URLSearchParams(state);
        const redirectParam = stateParams.get("redirect");
        if (redirectParam) {
          redirectUrl = decodeURIComponent(redirectParam);
        }
      } catch (error) {
        console.error("🚴 Error parsing state parameter:", error);
      }
    }
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("🚴 Strava OAuth error:", error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_oauth_failed`);
  }
} 