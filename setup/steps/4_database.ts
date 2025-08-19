import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { logSuccess, logInfo, getPackageManager, getProjectRoot } from "../utils";
import { STEP_FAILURE } from "../types";

export function runMigrations(): void {
  try {
    const envPath = join(getProjectRoot(), ".env.local");
    if (!existsSync(envPath)) {
      throw new STEP_FAILURE(".env.local not found. Create it and define DATABASE_URL.");
    }

    let dbUrl: string | undefined;
    const envContents = readFileSync(envPath, "utf8");
    const dbUrlLine = envContents
      .split(/\r?\n/)
      .find((l) => /^\s*DATABASE_URL\s*=/.test(l) && !/^\s*#/.test(l));
    dbUrl = dbUrlLine?.split("=").slice(1).join("=").trim();

    if (!dbUrl) {
      throw new STEP_FAILURE("DATABASE_URL missing in .env.local");
    }

    const isLocal = /localhost|127\.0\.0\.1/.test(dbUrl);
    const allowRemoteSkip = process.env.REMOTE_DB === "1";
    if (!isLocal && allowRemoteSkip) {
      logInfo("REMOTE_DB=1 set and remote DATABASE_URL detected; skipping local migrations.");
      return; // explicit remote skip path
    }
    if (!isLocal && !allowRemoteSkip) {
      throw new STEP_FAILURE("Remote DATABASE_URL detected. Set REMOTE_DB=1 to explicitly allow skipping local migrations.");
    }

    execSync(`${getPackageManager()} db:generate`, { stdio: "ignore" });
    logSuccess("Database migrations completed successfully");
  } catch (error) {
    if (error instanceof STEP_FAILURE) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new STEP_FAILURE(`Database migration step failed: ${message}`);
  }
}
