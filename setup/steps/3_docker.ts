import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

import {
  logInfo,
  logSuccess,
  logError,
  logWarning,
  getProjectRoot,
  checkDocker,
  dockerDaemonRunning,
} from "../utils";

// Start Docker Compose services
export function startDockerServices(): void {
  try {
    // Allow skipping docker setup via env or CI
    if (process.env.SKIP_DOCKER === "1" || process.env.SKIP_DOCKER === "true" || process.env.CI === "true") {
      logInfo("Skipping Docker services setup (SKIP_DOCKER/CI detected)");
      return;
    }

    // Check if Docker is available
    const dockerCommand = checkDocker();
    if (!dockerCommand) {
      logWarning(
        "Docker/Podman not found. Skipping Docker services. Install Docker if you need local services.",
      );
      return;
    }

    logInfo(`Using ${dockerCommand} as container runtime`);

    // Check if docker-compose.yml exists
    const projectRoot = getProjectRoot();
    const dockerComposePath = join(projectRoot, "docker-compose.yml");

    if (!existsSync(dockerComposePath)) {
      logWarning("docker-compose.yml not found. Skipping Docker services.");
      return;
    }

    if (!dockerDaemonRunning(dockerCommand)) {
      logWarning(
        `${dockerCommand} daemon is not running. Skipping Docker services. Start the daemon and rerun if needed.`,
      );
      return;
    }

    // Start Docker Compose services in detached mode
    logInfo("Starting Docker Compose services...");
    execSync(`${dockerCommand} compose up -d`, {
      stdio: "ignore",
      cwd: projectRoot,
    });

    logSuccess("Docker services started successfully");
  } catch (error) {
    logWarning("Continuing without Docker services due to an error starting them.");
    if (error instanceof Error) {
      logWarning(error.message);
    }
    // Do not throw; allow setup to proceed
  }
}
