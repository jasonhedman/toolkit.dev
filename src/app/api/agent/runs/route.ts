import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { runs } from "@trigger.dev/sdk/v3";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");

    // Fetch runs from Trigger.dev
    const runsResponse = await runs.list({
      limit,
      status: status ? [status as any] : undefined,
      // You can add more filters here
    });

    // Transform the data to match our AgentRun interface
    const transformedRuns = runsResponse.data.map((run) => ({
      id: run.id,
      taskId: run.id,
      status: run.status,
      model: (run as any).metadata?.selectedChatModel || "unknown",
      prompt: (run as any).metadata?.prompt || "No prompt available",
      toolkits: (run as any).metadata?.toolkits || [],
      createdAt: run.createdAt.toISOString(),
      completedAt: run.finishedAt?.toISOString(),
      output: (run as any).output ? JSON.stringify((run as any).output) : undefined,
      error: (run as any).error ? JSON.stringify((run as any).error) : undefined,
    }));

    return NextResponse.json({
      success: true,
      runs: transformedRuns,
      pagination: {
        hasMore: (runsResponse as any).hasMore || false,
        nextCursor: (runsResponse as any).nextCursor || null,
      },
    });

  } catch (error) {
    console.error("Error fetching agent runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent runs" },
      { status: 500 }
    );
  }
} 