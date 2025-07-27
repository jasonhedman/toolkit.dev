import type { exaParameters } from "./exa/base";
import type { ExaTools } from "./exa/tools/tools";
import type { githubParameters } from "./github/base";
import type { GithubTools } from "./github/tools";
import type { googleCalendarParameters } from "./google-calendar/base";
import type { GoogleCalendarTools } from "./google-calendar/tools";
import type { googleDriveParameters } from "./google-drive/base";
import type { GoogleDriveTools } from "./google-drive/tools";
import type { imageParameters } from "./image/base";
import type { ImageTools } from "./image/tools/tools";
import type { mem0Parameters } from "./mem0/base";
import type { Mem0Tools } from "./mem0/tools/tools";
import type { notionParameters } from "./notion/base";
import type { NotionTools } from "./notion/tools";
import type { e2bParameters } from "./e2b/base";
import type { E2BTools } from "./e2b/tools/tools";
import type { stravaParameters } from "./strava/base";
import type { StravaTools } from "./strava/tools";

export enum Toolkits {
  Exa = "exa",
  Image = "image",
  Github = "github",
  GoogleCalendar = "google-calendar",
  GoogleDrive = "google-drive",
  Memory = "memory",
  Notion = "notion",
  E2B = "e2b",
  Strava = "strava",
}

export type ToolkitParameters = {
  [Toolkits.Exa]: exaParameters;
  [Toolkits.Image]: imageParameters;
  [Toolkits.Github]: githubParameters;
  [Toolkits.GoogleCalendar]: googleCalendarParameters;
  [Toolkits.GoogleDrive]: googleDriveParameters;
  [Toolkits.Memory]: mem0Parameters;
  [Toolkits.Notion]: notionParameters;
  [Toolkits.E2B]: e2bParameters;
  [Toolkits.Strava]: stravaParameters;
};

export type ToolkitTools = {
  [Toolkits.Exa]: ExaTools;
  [Toolkits.Image]: ImageTools;
  [Toolkits.Github]: GithubTools;
  [Toolkits.GoogleCalendar]: GoogleCalendarTools;
  [Toolkits.GoogleDrive]: GoogleDriveTools;
  [Toolkits.Memory]: Mem0Tools;
  [Toolkits.Notion]: NotionTools;
  [Toolkits.E2B]: E2BTools;
  [Toolkits.Strava]: StravaTools;
};
