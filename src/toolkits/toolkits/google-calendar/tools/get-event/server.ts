import { type getEventTool } from "./base";
import { google } from "googleapis";
import type { ServerToolConfig } from "@/toolkits/types";

export const googleCalendarGetEventToolConfigServer = (
  accessToken: string,
): ServerToolConfig<
  typeof getEventTool.inputSchema.shape,
  typeof getEventTool.outputSchema.shape
> => {
  return {
    callback: async ({ calendarId, eventId }) => {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth });

      const response = await calendar.events.get({
        calendarId,
        eventId,
      });

      const event = response.data;

      return {
        id: event.id!,
        summary: event.summary ?? undefined,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
        start: {
          dateTime: event.start?.dateTime ?? undefined,
          date: event.start?.date ?? undefined,
          timeZone: event.start?.timeZone ?? undefined,
        },
        end: {
          dateTime: event.end?.dateTime ?? undefined,
          date: event.end?.date ?? undefined,
          timeZone: event.end?.timeZone ?? undefined,
        },
        status: event.status ?? undefined,
        visibility: event.visibility ?? undefined,
        organizer: event.organizer
          ? {
              email: event.organizer.email ?? undefined,
              displayName: event.organizer.displayName ?? undefined,
            }
          : undefined,
        attendees: event.attendees?.map((attendee) => ({
          email: attendee.email ?? undefined,
          displayName: attendee.displayName ?? undefined,
          responseStatus: attendee.responseStatus ?? undefined,
        })),
        recurringEventId: event.recurringEventId ?? undefined,
        recurrence: event.recurrence ?? undefined,
        created: event.created ?? undefined,
        updated: event.updated ?? undefined,
        htmlLink: event.htmlLink ?? undefined,
      };
    },
  };
};
