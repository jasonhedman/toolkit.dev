import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("🚴 CUSTOM STRAVA OAUTH HANDLER");
  console.log("Code:", code);
  console.log("State:", state);
  console.log("Error:", error);

  if (error) {
    console.log("🚴 OAuth error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_auth_failed`);
  }

  if (!code) {
    console.log("🚴 No authorization code received");
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_no_code`);
  }

  try {
    // Get the current session
    const session = await auth();
    if (!session?.user?.id) {
      console.log("🚴 No valid session found");
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=session_required`);
    }

    console.log("🚴 Exchanging code for tokens...");
    
    // Exchange authorization code for access token using the EXACT format that works
    const tokenParams = new URLSearchParams({
      client_id: process.env.AUTH_STRAVA_ID!,
      client_secret: process.env.AUTH_STRAVA_SECRET!,
      code: code,
      grant_type: "authorization_code",
    });

    console.log("🚴 Token request params:", tokenParams.toString());

    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
      },
      body: tokenParams,
    });

    console.log("🚴 Token response status:", tokenResponse.status);
    console.log("🚴 Token response headers:", Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log("🚴 Token exchange failed:", errorText);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_token_failed`);
    }

    const tokenData = await tokenResponse.json();
    console.log("🚴 Token exchange SUCCESS!");
    console.log("🚴 Token data keys:", Object.keys(tokenData));

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
          expires_at: tokenData.expires_at ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
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
          expires_at: tokenData.expires_at ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
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
        console.log("🚴 Error parsing state parameter:", error);
      }
    }
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("🚴 Custom Strava OAuth error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_oauth_failed`);
  }
} 