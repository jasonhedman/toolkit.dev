import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { runs } from "@trigger.dev/sdk/v3";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Cancel the run using Trigger.dev API
    await runs.cancel(id);

    return NextResponse.json({
      success: true,
      message: "Run cancelled successfully",
    });

  } catch (error) {
    console.error("Error cancelling agent run:", error);
    return NextResponse.json(
      { error: "Failed to cancel agent run" },
      { status: 500 }
    );
  }
} 