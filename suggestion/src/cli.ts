/**
 * SIG Arena - Suggestion Agent CLI
 *
 * Provides API server for generating hiring suggestions.
 */

import { CONFIG, validateConfig } from "./config/index.js";
import { SuggestionAgent } from "./agent/index.js";
import { startApiServer } from "./api/server.js";

const DIVIDER = "─".repeat(70);
const DOUBLE_DIVIDER = "═".repeat(70);

// Registry API configuration
const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3100";

const USAGE = `
SIG Arena - Suggestion Agent

USAGE
  pnpm start              Start API server
  pnpm dev                Start API server in dev mode

ENVIRONMENT
  XAI_API_KEY             Required. Your xAI API key.
  REGISTRY_URL            Registry API URL (default: http://localhost:3100)
  PORT                    API server port (default: 3300)

API ENDPOINTS
  GET  /health            Health check
  GET  /stats             Get agent stats
  POST /suggest/:jobId    Generate suggestion for job (requires auth)

EXAMPLE
  XAI_API_KEY=xxx pnpm start
`;

async function runServer(): Promise<void> {
  console.log(DOUBLE_DIVIDER);
  console.log("  SIG ARENA - SUGGESTION AGENT");
  console.log(DOUBLE_DIVIDER);
  console.log(`\n  Registry:    ${CONFIG.registryUrl}`);
  console.log(`  Model:       ${CONFIG.model}`);
  console.log(`  API Port:    ${parseInt(process.env.PORT || "3300", 10)}`);

  const agent = new SuggestionAgent();

  // Start API server
  const port = parseInt(process.env.PORT || "3300", 10);
  startApiServer(agent, port);

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n  Shutting down...");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    process.exit(0);
  });

  console.log("\n  Press Ctrl+C to stop\n");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command && !["help", "--help"].includes(command)) {
    try {
      validateConfig();
    } catch (error) {
      console.error("[ERROR]", error);
      process.exit(1);
    }
  }

  switch (command) {
    case "help":
    case "--help":
      console.log(USAGE);
      break;

    default:
      await runServer();
      break;
  }
}

main().catch((error) => {
  console.error("[FATAL]", error.message || error);
  process.exit(1);
});
