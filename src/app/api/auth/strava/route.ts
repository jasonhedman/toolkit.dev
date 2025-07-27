import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { env } from "@/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_no_code`);
  }

  try {
    // Get the current session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=session_required`);
    }

    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      client_id: env.AUTH_STRAVA_ID,
      client_secret: env.AUTH_STRAVA_SECRET,
      code: code,
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_token_failed`);
    }

    const tokenData = await tokenResponse.json();

    // Save the Strava account to the database
    const existingAccount = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "strava",
      },
    });

    if (existingAccount) {
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
    } else {
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
    }

    // Handle redirect
    let redirectUrl = `${process.env.NEXTAUTH_URL}/?strava_connected=true`;
    if (state) {
      try {
        const stateParams = new URLSearchParams(state);
        const redirectParam = stateParams.get("redirect");
        if (redirectParam) {
          redirectUrl = decodeURIComponent(redirectParam);
        }
      } catch (error) {
        // Ignore state parsing errors
      }
    }
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=strava_oauth_failed`);
  }
} 