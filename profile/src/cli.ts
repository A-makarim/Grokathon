/**
 * Profile Agent CLI
 */

import { serve } from "@hono/node-server";
import { CONFIG, validateConfig } from "./config/index.js";
import { app } from "./api/server.js";

const PORT = parseInt(process.env.PORT || "3200", 10);

async function main() {
  try {
    validateConfig();
  } catch (error) {
    console.error("[ERROR]", error);
    process.exit(1);
  }

  console.log("[Profile Agent] Starting API server...");
  console.log(`[Profile Agent] Registry URL: ${CONFIG.registryUrl}`);
  console.log(`[Profile Agent] Model: ${CONFIG.model}`);

  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (info) => {
      console.log(`[Profile Agent] Server running at http://localhost:${info.port}`);
    }
  );
}

main().catch((error) => {
  console.error("[FATAL]", error);
  process.exit(1);
});
