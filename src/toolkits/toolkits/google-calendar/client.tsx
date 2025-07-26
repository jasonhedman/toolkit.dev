import { SiGooglecalendar } from "@icons-pack/react-simple-icons";

import { createClientToolkit } from "@/toolkits/create-toolkit";

import { GoogleCalendarTools } from "./tools";
import { baseGoogleCalendarToolkitConfig } from "./base";
import {
  googleCalendarListCalendarsToolConfigClient,
  googleCalendarGetCalendarToolConfigClient,
  googleCalendarListEventsToolConfigClient,
  googleCalendarGetEventToolConfigClient,
  googleCalendarSearchEventsToolConfigClient,
  googleCalendarCreateEventToolConfigClient,
  googleCalendarFindAvailabilityToolConfigClient,
} from "./tools/client";

import { ToolkitGroups } from "@/toolkits/types";

import { GoogleCalendarWrapper } from "./wrapper";

export const googleCalendarClientToolkit = createClientToolkit(
  baseGoogleCalendarToolkitConfig,
  {
    name: "Google Calendar",
    description: "Find availability and schedule meetings",
    icon: SiGooglecalendar,
    form: null,
    Wrapper: GoogleCalendarWrapper,
    type: ToolkitGroups.DataSource,
  },
  {
    [GoogleCalendarTools.ListCalendars]:
      googleCalendarListCalendarsToolConfigClient,
    [GoogleCalendarTools.GetCalendar]:
      googleCalendarGetCalendarToolConfigClient,
    [GoogleCalendarTools.ListEvents]: googleCalendarListEventsToolConfigClient,
    [GoogleCalendarTools.GetEvent]: googleCalendarGetEventToolConfigClient,
    [GoogleCalendarTools.SearchEvents]:
      googleCalendarSearchEventsToolConfigClient,
    [GoogleCalendarTools.CreateEvent]:
      googleCalendarCreateEventToolConfigClient,
    [GoogleCalendarTools.FindAvailability]:
      googleCalendarFindAvailabilityToolConfigClient,
  },
);
