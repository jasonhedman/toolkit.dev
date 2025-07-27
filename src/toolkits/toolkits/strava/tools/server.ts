import { createServerTool } from "@/toolkits/create-tool";
import {
  getAthleteProfileTool,
  getAthleteStatsTool,
  getAthleteZonesTool,
} from "./athlete/base";
import { 
  getAthleteActivitiesTool,
  getActivityDetailsTool
} from "./activities/base";
import {
  searchSegmentsTool,
  getSegmentDetailsTool,
  getSegmentLeaderboardTool,
} from "./segments/base";
import { getRoutesTool } from "./routes/base";

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

interface StravaApiHeaders extends Record<string, string> {
  Authorization: string;
  'Content-Type': string;
}

export const stravaGetAthleteProfileToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getAthleteProfileTool, async () => {
    const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch athlete profile: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  });

export const stravaGetAthleteActivitiesToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getAthleteActivitiesTool, async (input: {
    page?: number;
    per_page?: number;
    before?: number;
    after?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (input.page) searchParams.append('page', input.page.toString());
    if (input.per_page) searchParams.append('per_page', input.per_page.toString());
    if (input.before) searchParams.append('before', input.before.toString());
    if (input.after) searchParams.append('after', input.after.toString());

    const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${searchParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch athlete activities: ${response.status} ${response.statusText}`);
    }

    const activities = await response.json();
    return { activities };
  });

export const stravaGetActivityDetailsToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getActivityDetailsTool, async (input: {
    id: number;
    include_all_efforts?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (input.include_all_efforts) searchParams.append('include_all_efforts', 'true');

    const response = await fetch(`${STRAVA_API_BASE}/activities/${input.id}?${searchParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch activity details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  });

export const stravaGetAthleteStatsToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getAthleteStatsTool, async () => {
    // First get the athlete ID
    const athleteResponse = await fetch(`${STRAVA_API_BASE}/athlete`, {
      method: 'GET',
      headers,
    });

    if (!athleteResponse.ok) {
      throw new Error(`Failed to fetch athlete: ${athleteResponse.status} ${athleteResponse.statusText}`);
    }

    const athlete = await athleteResponse.json();

    // Then get the stats
    const statsResponse = await fetch(`${STRAVA_API_BASE}/athletes/${athlete.id}/stats`, {
      method: 'GET',
      headers,
    });

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch athlete stats: ${statsResponse.status} ${statsResponse.statusText}`);
    }

    const data = await statsResponse.json();
    return data;
  });

export const stravaSearchSegmentsToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(searchSegmentsTool, async (input: {
    bounds: string;
    activity_type?: "running" | "riding";
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('bounds', input.bounds);
    if (input.activity_type) searchParams.append('activity_type', input.activity_type);

    const response = await fetch(`${STRAVA_API_BASE}/segments/explore?${searchParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to search segments: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { segments: data.segments || [] };
  });

export const stravaGetSegmentDetailsToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getSegmentDetailsTool, async (input: { id: number }) => {
    const response = await fetch(`${STRAVA_API_BASE}/segments/${input.id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch segment details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  });

export const stravaGetSegmentLeaderboardToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getSegmentLeaderboardTool, async (input: {
    id: number;
    gender?: "M" | "F";
    age_group?: "0_19" | "20_24" | "25_34" | "35_44" | "45_54" | "55_64" | "65_plus";
    weight_class?: "0_124" | "125_149" | "150_164" | "165_179" | "180_199" | "200_224" | "225_plus";
    following?: boolean;
    club_id?: number;
    date_range?: "this_year" | "this_month" | "this_week" | "today";
    context_entries?: number;
    page?: number;
    per_page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (input.gender) searchParams.append('gender', input.gender);
    if (input.age_group) searchParams.append('age_group', input.age_group);
    if (input.weight_class) searchParams.append('weight_class', input.weight_class);
    if (input.following) searchParams.append('following', 'true');
    if (input.club_id) searchParams.append('club_id', input.club_id.toString());
    if (input.date_range) searchParams.append('date_range', input.date_range);
    if (input.context_entries) searchParams.append('context_entries', input.context_entries.toString());
    if (input.page) searchParams.append('page', input.page.toString());
    if (input.per_page) searchParams.append('per_page', input.per_page.toString());

    const response = await fetch(`${STRAVA_API_BASE}/segments/${input.id}/leaderboard?${searchParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch segment leaderboard: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  });

export const stravaGetRoutesToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getRoutesTool, async (input: {
    page?: number;
    per_page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (input.page) searchParams.append('page', input.page.toString());
    if (input.per_page) searchParams.append('per_page', input.per_page.toString());

    const response = await fetch(`${STRAVA_API_BASE}/athlete/routes?${searchParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch routes: ${response.status} ${response.statusText}`);
    }

    const routes = await response.json();
    return { routes };
  });

export const stravaGetAthleteZonesToolConfigServer = (headers: StravaApiHeaders) =>
  createServerTool(getAthleteZonesTool, async () => {
    const response = await fetch(`${STRAVA_API_BASE}/athlete/zones`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch athlete zones: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }); 