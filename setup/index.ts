#!/usr/bin/env node

import { log, logStep, logError } from "./utils";

import {
  createEnvFile,
  installDependencies,
  runMigrations,
  startDockerServices,
} from "./steps";

// Main setup function
async function main(): Promise<void> {
  log("🚀 Toolkit.dev Setup Script", "bright");
  log(
    "This script will help you set up the Toolkit.dev project for development.\n",
    "cyan",
  );

  const steps = [
    {
      name: "Creating environment configuration",
      step: createEnvFile,
    },
    {
      name: "Installing project dependencies",
      step: installDependencies,
    },
    {
      name: "Starting Docker services",
      step: startDockerServices,
    },
    {
      name: "Running database migrations",
      step: runMigrations,
    },
  ];

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      logStep(`Step ${i + 1}/${steps.length}`, `${step.name}...`);
      step.step();
    }
  } catch (error) {
    logError("Setup failed: " + (error as Error).message);
    process.exit(1);
  }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    if (error instanceof Error && error.name === "ExitPromptError") {
      log(
        "\n👋 Setup cancelled. You can run the setup again anytime with: pnpm dev:setup",
        "yellow",
      );
      process.exit(0);
    } else {
      logError("Setup failed: " + (error as Error).message);
      process.exit(1);
    }
  });
}
