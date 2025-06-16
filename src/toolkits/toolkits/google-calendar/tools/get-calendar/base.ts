import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getCalendarTool = createBaseTool({
  description: "Get details of a specific calendar by ID",
  inputSchema: z.object({
    calendarId: z.string().describe("The ID of the calendar to retrieve"),
  }),
  outputSchema: z.object({
    id: z.string().describe("The calendar ID"),
    summary: z.string().describe("The calendar title"),
    description: z.string().optional().describe("The calendar description"),
    timeZone: z.string().describe("The time zone of the calendar"),
    colorId: z.string().optional().describe("The color ID of the calendar"),
    backgroundColor: z
      .string()
      .optional()
      .describe("The background color of the calendar"),
    foregroundColor: z
      .string()
      .optional()
      .describe("The foreground color of the calendar"),
    selected: z
      .boolean()
      .optional()
      .describe("Whether the calendar is selected"),
    accessRole: z.string().describe("The access role for the calendar"),
    primary: z
      .boolean()
      .optional()
      .describe("Whether this is the primary calendar"),
    location: z.string().optional().describe("The location of the calendar"),
  }),
});
