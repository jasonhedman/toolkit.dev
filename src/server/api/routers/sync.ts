import { clientToolkits } from "@/toolkits/toolkits/client";
import { adminProcedure, createTRPCRouter } from "../trpc";
import type { Message } from "ai";

// Define all available tools from each toolkit
const ALL_TOOLS = Object.entries(clientToolkits).reduce(
  (acc, [toolkitName, toolkit]) => {
    return {
      ...acc,
      [toolkitName]: {
        name: toolkit.name,
        tools: Object.keys(toolkit.tools),
      },
    };
  },
  {} as Record<string, { name: string; tools: string[] }>,
);

export const syncRouter = createTRPCRouter({
  syncToolUsage: adminProcedure.mutation(async ({ ctx }) => {
    // Create toolkits and tools
    const toolkitMap = new Map<string, string>(); // toolkit name -> toolkit id

    for (const [toolkitName, { tools }] of Object.entries(ALL_TOOLS)) {
      const existingToolkit = await ctx.db.toolkit.findUnique({
        where: {
          id: toolkitName,
        },
      });

      if (existingToolkit) {
        toolkitMap.set(toolkitName, existingToolkit.id);
        continue;
      }

      // Create toolkit
      const toolkit = await ctx.db.toolkit.create({
        data: {
          id: toolkitName,
        },
      });

      toolkitMap.set(toolkitName, toolkit.id);

      for (const toolName of tools) {
        const existingTool = await ctx.db.tool.findUnique({
          where: {
            id_toolkitId: {
              id: toolName,
              toolkitId: toolkit.id,
            },
          },
        });

        if (existingTool) {
          continue;
        }

        await ctx.db.tool.create({
          data: {
            id: toolName,
            toolkitId: toolkit.id,
          },
        });
      }
    }

    const messages = await ctx.db.message.findMany({
      where: {
        role: "assistant", // Only assistant messages can have tool invocations
      },
      select: {
        id: true,
        parts: true,
        createdAt: true,
      },
    });

    // Track tool usage
    const toolUsageMap = new Map<string, number>();

    // Process each message
    for (const message of messages) {
      const parts: Message["parts"] =
        message.parts as unknown as Message["parts"];

      if (!parts) {
        continue;
      }

      // Look for tool-invocation parts
      for (const part of parts) {
        if (part.type === "tool-invocation" && part.toolInvocation) {
          const { toolName } = part.toolInvocation;

          // Parse toolkit and tool from toolName (format: "toolkit_tool")
          const [toolkit, tool] = toolName.split("_");

          if (toolkit && tool) {
            const key = `${toolkit}_${tool}`;
            toolUsageMap.set(key, (toolUsageMap.get(key) ?? 0) + 1);
          } else {
            console.warn(`⚠️  Invalid tool name format: ${toolName}`);
          }
        }
      }
    }

    const updatePromises = Array.from(toolUsageMap.entries()).map(
      async ([key, count]) => {
        const [toolkitName, toolName] = key.split("_");

        if (toolkitName && toolName) {
          const toolkitId = toolkitMap.get(toolkitName);
          if (toolkitId) {
            return ctx.db.tool.updateMany({
              where: {
                id: toolName,
                toolkitId: toolkitId,
              },
              data: {
                usageCount: count,
              },
            });
          }
        }
      },
    );

    await Promise.all(updatePromises.filter(Boolean));
  }),
});
