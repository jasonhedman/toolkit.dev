import { cookies } from "next/headers";
import type { ChatPreferences } from "./types";
import { COOKIE_KEYS } from "./keys";
import { resolveInitialToolkits } from "./default-toolkits";

// Helper to safely parse JSON from cookie value
const safeParseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return fallback;
  }
};

// Server-side cookie utilities
export const serverCookieUtils = {
  // Get all preferences from server-side cookies
  async getPreferences(): Promise<ChatPreferences> {
    try {
      const cookieStore = await cookies();

      return {
        selectedChatModel: safeParseJson(
          cookieStore.get(COOKIE_KEYS.SELECTED_CHAT_MODEL)?.value,
          undefined,
        ),
        imageGenerationModel: safeParseJson(
          cookieStore.get(COOKIE_KEYS.IMAGE_GENERATION_MODEL)?.value,
          undefined,
        ),
        useNativeSearch: safeParseJson(
          cookieStore.get(COOKIE_KEYS.USE_NATIVE_SEARCH)?.value,
          false,
        ),
        toolkits: resolveInitialToolkits(
          safeParseJson(
            cookieStore.get(COOKIE_KEYS.TOOLKITS)?.value,
            cookieStore.has(COOKIE_KEYS.TOOLKITS) ? [] : undefined,
          ),
          Boolean(process.env.EXA_API_KEY) ||
            Boolean(process.env.OPENAI_API_KEY),
          cookieStore.has(COOKIE_KEYS.USE_NATIVE_SEARCH),
        ),
      };
    } catch (error) {
      console.warn("Failed to read cookies:", error);
      return {};
    }
  },
};
