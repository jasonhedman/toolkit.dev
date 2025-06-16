import { type getCalendarTool } from "./base";
import { google } from "googleapis";
import type { ServerToolConfig } from "@/toolkits/types";

export const googleCalendarGetCalendarToolConfigServer = (
  accessToken: string,
): ServerToolConfig<
  typeof getCalendarTool.inputSchema.shape,
  typeof getCalendarTool.outputSchema.shape
> => {
  return {
    callback: async ({ calendarId }) => {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth });

      const response = await calendar.calendars.get({
        calendarId,
      });

      const cal = response.data;

      return {
        id: cal.id!,
        summary: cal.summary!,
        description: cal.description ?? undefined,
        timeZone: cal.timeZone!,
        colorId: cal.etag ?? undefined,
        backgroundColor: cal.etag ?? undefined,
        foregroundColor: cal.etag ?? undefined,
        selected: undefined,
        accessRole: "owner",
        primary: false,
        location: cal.location ?? undefined,
      };
    },
  };
};
