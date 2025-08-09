import { NextResponse, type NextRequest } from "next/server";
import {
  buildOnrampUrl,
  type PaymentMethod,
  Experience,
} from "./build-onramp-url";
import { createSessionToken } from "./cdp-lib";

type PostBody = {
  amount?: number;
  method?: PaymentMethod;
  origin?: string;
  address?: string;
  partnerUserId?: string;
  redirectUrl?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostBody;

    // Validate required fields
    if (!body.address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      );
    }

    if (body.amount && (typeof body.amount !== "number" || body.amount <= 0)) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    // Create session token using CDP SDK
    let sessionToken: string;

    try {
      const { token } = await createSessionToken(body.address);
      sessionToken = token;
    } catch (error) {
      console.error("Failed to create CDP session token:", error);
      return NextResponse.json(
        {
          error: "Failed to create session token",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }

    // Build the onramp URL with all the parameters
    const url = buildOnrampUrl({
      sessionToken,
      amount: body.amount,
      method: body.method,
      origin: body.origin,
      experience: Experience.Buy,
      defaultNetwork: "base",
      defaultAsset: "USDC",
      fiatCurrency: "USD",
      partnerUserId: body.partnerUserId,
      redirectUrl: body.redirectUrl,
    });

    return NextResponse.json({
      url,
      sessionToken,
    });
  } catch (error) {
    console.error("Onramp API error:", error);
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
