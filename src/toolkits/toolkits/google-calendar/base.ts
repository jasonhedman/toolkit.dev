import type { ToolkitConfig } from "@/toolkits/types";
import { z } from "zod";
import { GoogleCalendarTools } from "./tools";
import {
  listCalendarsTool,
  getCalendarTool,
  listEventsTool,
  getEventTool,
  searchEventsTool,
} from "./tools";

export const googleCalendarParameters = z.object({});

export const baseGoogleCalendarToolkitConfig: ToolkitConfig<
  GoogleCalendarTools,
  typeof googleCalendarParameters.shape
> = {
  tools: {
    [GoogleCalendarTools.ListCalendars]: listCalendarsTool,
    [GoogleCalendarTools.GetCalendar]: getCalendarTool,
    [GoogleCalendarTools.ListEvents]: listEventsTool,
    [GoogleCalendarTools.GetEvent]: getEventTool,
    [GoogleCalendarTools.SearchEvents]: searchEventsTool,
  },
  parameters: googleCalendarParameters,
};
