import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const createAuthSchema = () => {
  const authSchema = {};

  if (process.env.AUTH_DISCORD_ID || process.env.AUTH_DISCORD_SECRET) {
    authSchema.AUTH_DISCORD_ID = z.string();
    authSchema.AUTH_DISCORD_SECRET = z.string();
  }

  if (process.env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_SECRET) {
    authSchema.AUTH_GOOGLE_ID = z.string();
    authSchema.AUTH_GOOGLE_SECRET = z.string();
  }

  if (process.env.AUTH_GITHUB_ID || process.env.AUTH_GITHUB_SECRET) {
    authSchema.AUTH_GITHUB_ID = z.string();
    authSchema.AUTH_GITHUB_SECRET = z.string();
  }

  if (process.env.AUTH_TWITTER_ID || process.env.AUTH_TWITTER_SECRET) {
    authSchema.AUTH_TWITTER_ID = z.string();
    authSchema.AUTH_TWITTER_SECRET = z.string();
  }

  if (process.env.AUTH_NOTION_ID || process.env.AUTH_NOTION_SECRET) {
    authSchema.AUTH_NOTION_ID = z.string();
    authSchema.AUTH_NOTION_SECRET = z.string();
  }

  if (process.env.AUTH_STRAVA_ID || process.env.AUTH_STRAVA_SECRET) {
    authSchema.AUTH_STRAVA_ID = z.string();
    authSchema.AUTH_STRAVA_SECRET = z.string();
  }

  if (process.env.AUTH_SPOTIFY_ID || process.env.AUTH_SPOTIFY_SECRET) {
    authSchema.AUTH_SPOTIFY_ID = z.string();
    authSchema.AUTH_SPOTIFY_SECRET = z.string();
  }

  return authSchema;
};

const createImageModelSchema = () => {
  const imageModelSchema = {};

  return imageModelSchema;
};

const createToolkitsSchema = () => {
  const toolkitsSchema = {};

  // Web search toolkit
  if (process.env.EXA_API_KEY) toolkitsSchema.EXA_API_KEY = z.string();

  // Mem0 toolkit
  if (process.env.MEM0_API_KEY) toolkitsSchema.MEM0_API_KEY = z.string();

  // Code Interpreter toolkit
  if (process.env.E2B_API_KEY) toolkitsSchema.E2B_API_KEY = z.string();

  // Image toolkit
  if (process.env.BLOB_READ_WRITE_TOKEN)
    toolkitsSchema.BLOB_READ_WRITE_TOKEN = z.string();
  if (process.env.OPENAI_API_KEY) toolkitsSchema.OPENAI_API_KEY = z.string();
  if (process.env.XAI_API_KEY) toolkitsSchema.XAI_API_KEY = z.string();
  if (process.env.FAL_API_KEY) toolkitsSchema.FAL_API_KEY = z.string();
  if (process.env.FIREWORKS_API_KEY)
    toolkitsSchema.FIREWORKS_API_KEY = z.string();
  if (process.env.LUMA_API_KEY) toolkitsSchema.LUMA_API_KEY = z.string();

  return toolkitsSchema;
};

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // environment
    NEXTAUTH_URL: z.string().url(),
    AUTH_SECRET: z.string(),
    ...createAuthSchema(),

    // database
    DATABASE_URL: z.string().url(),

    // inference
    OPENROUTER_API_KEY: z.string().optional(),

    // toolkits
    ...createToolkitsSchema(),
    ...createImageModelSchema(),

    // misc
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PRISMA_LOG_QUERIES: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CDP_PROJECT_ID: z.string(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_CDP_PROJECT_ID: process.env.NEXT_PUBLIC_CDP_PROJECT_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
