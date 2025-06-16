import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const getEventTool = createBaseTool({
  description: "Get details of a specific event by ID",
  inputSchema: z.object({
    calendarId: z
      .string()
      .describe("The ID of the calendar containing the event"),
    eventId: z.string().describe("The ID of the event to retrieve"),
  }),
  outputSchema: z.object({
    id: z.string().describe("Event ID"),
    summary: z.string().optional().describe("Event title"),
    description: z.string().optional().describe("Event description"),
    location: z.string().optional().describe("Event location"),
    start: z.object({
      dateTime: z
        .string()
        .optional()
        .describe("Start time as RFC3339 timestamp"),
      date: z.string().optional().describe("Start date (for all-day events)"),
      timeZone: z.string().optional().describe("Time zone"),
    }),
    end: z.object({
      dateTime: z.string().optional().describe("End time as RFC3339 timestamp"),
      date: z.string().optional().describe("End date (for all-day events)"),
      timeZone: z.string().optional().describe("Time zone"),
    }),
    status: z.string().optional().describe("Event status"),
    visibility: z.string().optional().describe("Event visibility"),
    organizer: z
      .object({
        email: z.string().optional(),
        displayName: z.string().optional(),
      })
      .optional(),
    attendees: z
      .array(
        z.object({
          email: z.string().optional(),
          displayName: z.string().optional(),
          responseStatus: z.string().optional(),
        }),
      )
      .optional(),
    recurringEventId: z
      .string()
      .optional()
      .describe(
        "For instances of recurring events, the ID of the recurring event",
      ),
    recurrence: z
      .array(z.string())
      .optional()
      .describe("List of RRULE, EXRULE, RDATE and EXDATE lines"),
    created: z.string().optional().describe("Event creation time"),
    updated: z.string().optional().describe("Last modification time"),
    htmlLink: z
      .string()
      .optional()
      .describe("An absolute link to this event in the Google Calendar Web UI"),
  }),
});
