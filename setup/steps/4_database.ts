import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import {
  logSuccess,
  logError,
  logInfo,
  logWarning,
  getPackageManager,
  getProjectRoot,
} from "../utils";

export function runMigrations(): void {
  try {
    // Allow skipping via env flags or CI
    if (
      process.env.SKIP_DB === "1" ||
      process.env.SKIP_DB === "true" ||
      // support both SKIP_DB_MIGRATIONS and SKIP_DB_MIGRATE spellings
      process.env.SKIP_DB_MIGRATIONS === "1" ||
      process.env.SKIP_DB_MIGRATIONS === "true" ||
      process.env.SKIP_DB_MIGRATE === "1" ||
      process.env.SKIP_DB_MIGRATE === "true" ||
      process.env.CI === "true"
    ) {
      logInfo(
        "Skipping database migrations (SKIP_DB/SKIP_DB_MIGRATIONS/SKIP_DB_MIGRATE/CI detected)",
      );
      return;
    }

    // If no local env file, warn and skip to keep setup non-blocking
    const envPath = join(getProjectRoot(), ".env.local");
    if (!existsSync(envPath)) {
      logWarning(".env.local not found. Skipping database migrations. Create it to enable local DB.");
      return;
    }

    // If DATABASE_URL isn't configured, skip to avoid blocking in ephemeral/dev envs
    try {
      const envContents = readFileSync(envPath, "utf8");
      const dbUrlLine = envContents
        .split(/\r?\n/)
        .find((l) => /^\s*DATABASE_URL\s*=/.test(l) && !/^\s*#/.test(l));
      const dbUrl = dbUrlLine?.split("=").slice(1).join("=").trim();
      if (!dbUrl) {
        logWarning(
          "DATABASE_URL missing in .env.local. Skipping database migrations. Configure it to enable Prisma.",
        );
        return;
      }
    } catch {
      // If we can't read/parse for some reason, proceed; failures will be caught below
    }

    // Attempt to run migrations (script loads env via dotenv)
    execSync(`${getPackageManager()} db:generate`, { stdio: "ignore" });
    logSuccess("Database migrations completed successfully");
  } catch (error) {
    // Don't block local dev if DB isn't available
    logWarning("Continuing without running database migrations (DB unavailable or command failed)");
    if (error instanceof Error) {
      logError(error.message);
    }
  }
}
