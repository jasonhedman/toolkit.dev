import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const searchMessagesTool = createBaseTool({
    description: "Search for messages in your Slack workspace",
    inputSchema: z.object({
        query: z.string().describe("Search query string"),
        count: z
            .number()
            .optional()
            .describe("Number of results to return. Defaults to 20"),
        sort: z
            .enum(["score", "timestamp"])
            .optional()
            .describe("Sort results by relevance (score) or time (timestamp)"),
    }),
    outputSchema: z.object({
        messages: z.array(
            z.object({
                type: z.string(),
                text: z.string(),
                user: z.string().optional(),
                username: z.string().optional(),
                ts: z.string(),
                channel: z
                    .object({
                        id: z.string(),
                        name: z.string(),
                    })
                    .optional(),
                permalink: z.string().optional(),
            }),
        ),
        total: z.number(),
    }),
});
