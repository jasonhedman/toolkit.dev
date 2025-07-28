import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { tasks } from "@trigger.dev/sdk/v3";
import type { runAgentTask } from "@/trigger/agent";
import { z } from "zod";

const triggerAgentSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
  toolkits: z.array(z.object({
    id: z.string(),
    parameters: z.record(z.any()),
  })).optional(),
  selectedChatModel: z.string().optional(),
  systemPrompt: z.string().optional(),
  useNativeSearch: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = triggerAgentSchema.parse(body);

    // Trigger the agent task
    const handle = await tasks.trigger<typeof runAgentTask>("run-agent", {
      messages: validatedData.messages,
      toolkits: validatedData.toolkits?.map(t => ({ 
        id: t.id as any, 
        parameters: t.parameters 
      })) || [],
      selectedChatModel: validatedData.selectedChatModel || "openai/gpt-4",
      systemPrompt: validatedData.systemPrompt,
      useNativeSearch: validatedData.useNativeSearch || false,
    });

    // Store the run information in your database (optional)
    // This would be helpful for tracking runs in the dashboard
    // await db.agentRun.create({
    //   data: {
    //     id: handle.id,
    //     taskId: handle.id,
    //     userId: session.user.id,
    //     status: "QUEUED",
    //     model: validatedData.selectedChatModel || "openai/gpt-4",
    //     prompt: validatedData.messages[0]?.content || "",
    //     toolkits: validatedData.toolkits?.map(t => t.id) || [],
    //     systemPrompt: validatedData.systemPrompt,
    //     useNativeSearch: validatedData.useNativeSearch || false,
    //   },
    // });

    return NextResponse.json({
      success: true,
      taskId: handle.id,
      handle: handle,
    });

  } catch (error) {
    console.error("Error triggering agent task:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 