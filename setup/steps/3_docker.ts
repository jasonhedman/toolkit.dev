import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

import { logInfo, logSuccess, getProjectRoot, checkDocker, dockerDaemonRunning } from "../utils";
import { STEP_FAILURE } from "../types";

// Start Docker Compose services
export function startDockerServices(): void {
  try {
  // Strict: do not allow skipping; environment must support required services.

    // Check if Docker is available
    const dockerCommand = checkDocker();
    if (!dockerCommand) {
      throw new STEP_FAILURE("Docker/Podman not found. Install Docker to continue.");
    }

    logInfo(`Using ${dockerCommand} as container runtime`);

    // Check if docker-compose.yml exists
    const projectRoot = getProjectRoot();
    const dockerComposePath = join(projectRoot, "docker-compose.yml");

    if (!existsSync(dockerComposePath)) {
      throw new STEP_FAILURE("docker-compose.yml not found. Ensure it exists and is valid.");
    }

    const daemonRunning = dockerDaemonRunning(dockerCommand);
    if (!daemonRunning) {
      throw new STEP_FAILURE(`${dockerCommand} daemon is not running. Start it and rerun setup.`);
    }

    // Start Docker Compose services in detached mode
    logInfo("Starting Docker Compose services...");
    execSync(`${dockerCommand} compose up -d`, {
      stdio: "ignore",
      cwd: projectRoot,
    });

    logSuccess("Docker services started successfully");
  } catch (error) {
    if (error instanceof STEP_FAILURE) {
      throw error; // propagate strict failure
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new STEP_FAILURE(`Error starting Docker services: ${message}`);
  }
}
