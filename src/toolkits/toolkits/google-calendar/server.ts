import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseGoogleCalendarToolkitConfig } from "./base";
import {
  googleCalendarListCalendarsToolConfigServer,
  googleCalendarGetCalendarToolConfigServer,
  googleCalendarListEventsToolConfigServer,
  googleCalendarGetEventToolConfigServer,
  googleCalendarSearchEventsToolConfigServer,
} from "./tools/server";
import { GoogleCalendarTools } from "./tools";
import { api } from "@/trpc/server";

export const googleCalendarToolkitServer = createServerToolkit(
  baseGoogleCalendarToolkitConfig,
  `You have access to the Google Calendar toolkit for comprehensive calendar management and scheduling. This toolkit provides:

- **List Calendars**: Get all available calendars for the user
- **Get Calendar**: Retrieve detailed information about a specific calendar
- **List Events**: Get events from a calendar within a date range
- **Get Event**: Retrieve detailed information about a specific event
- **Search Events**: Find events matching specific criteria across calendars

**Tool Sequencing Workflows:**
1. **Calendar Overview**: Start with List Calendars to see available calendars, then use Get Calendar for specific calendar details
2. **Event Management**: Use List Events to see upcoming events, then Get Event for detailed information about specific events
3. **Event Discovery**: Use Search Events to find events by keywords, participants, or topics across all calendars
4. **Schedule Analysis**: Combine List Events across multiple calendars to analyze scheduling patterns and availability

**Best Practices:**
- Always specify appropriate date ranges when listing events to avoid overwhelming results
- Use Search Events for finding specific meetings, appointments, or events by keywords
- When analyzing schedules, consider different calendar types (personal, work, shared calendars)
- Check multiple calendars when assessing availability or conflicts`,
  async () => {
    const account = await api.accounts.getAccountByProvider("google");

    if (!account?.access_token) {
      throw new Error("No Google account found or access token missing");
    }

    return {
      [GoogleCalendarTools.ListCalendars]:
        googleCalendarListCalendarsToolConfigServer(account.access_token),
      [GoogleCalendarTools.GetCalendar]:
        googleCalendarGetCalendarToolConfigServer(account.access_token),
      [GoogleCalendarTools.ListEvents]:
        googleCalendarListEventsToolConfigServer(account.access_token),
      [GoogleCalendarTools.GetEvent]: googleCalendarGetEventToolConfigServer(
        account.access_token,
      ),
      [GoogleCalendarTools.SearchEvents]:
        googleCalendarSearchEventsToolConfigServer(account.access_token),
    };
  },
);
