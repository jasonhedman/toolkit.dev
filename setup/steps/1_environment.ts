import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import {
  logSuccess,
  logWarning,
  getProjectRoot,
  getPackageRunner,
} from "../utils";

// Create .env.local file
export function createEnvFile() {
  const projectRoot = getProjectRoot();
  const envLocalPath = join(projectRoot, ".env.local");

  if (existsSync(envLocalPath)) {
    logSuccess(".env.local already exists.");
    return;
  }

  const envExamplePath = join(projectRoot, ".env.example");
  let envContent: string;

  if (existsSync(envExamplePath)) {
    envContent = readFileSync(envExamplePath, "utf8");
  } else {
    throw new Error(".env.example not found");
  }

  writeFileSync(envLocalPath, envContent);
  logSuccess("Created .env.local file");

  // Check if AUTH_SECRET is empty and generate it if needed
  const authSecretRegex = /^AUTH_SECRET=(.*)$/m;
  const authSecretMatch = authSecretRegex.exec(envContent);
  const authSecretValue = authSecretMatch?.[1]?.trim() ?? "";

  if (authSecretValue === "" || authSecretValue === '""') {
    try {
      execSync(`${getPackageRunner()} auth secret`, {
        input: "y\n",
        encoding: "utf8",
        stdio: ["pipe", "ignore", "ignore"],
      });
      logSuccess("Generated AUTH_SECRET");
  } catch {
      logWarning(
        `Failed to generate AUTH_SECRET with '${getPackageRunner()} auth secret'. Please run it manually and add the value to .env.local.`,
      );
    }
  } else {
    logSuccess("AUTH_SECRET already configured");
  }
}
