/**
 * Suggestion API Server
 *
 * Exposes endpoints for generating hiring suggestions.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import { SuggestionAgent } from "../agent/index.js";
import { CONFIG } from "../config/index.js";

export function createApiServer(agent: SuggestionAgent) {
  const app = new Hono();

  // Middleware
  app.use("*", cors());

  // Health check
  app.get("/health", (c) => {
    return c.json({ status: "ok", service: "suggestion-agent" });
  });

  // Get agent stats
  app.get("/stats", async (c) => {
    return c.json({
      status: "running",
      model: CONFIG.model,
      registryUrl: CONFIG.registryUrl,
    });
  });

  // Generate suggestion for a job
  app.post("/suggest/:jobId", async (c) => {
    try {
      const jobId = c.req.param("jobId");
      const authHeader = c.req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Authorization required" }, 401);
      }

      const agentToken = authHeader.replace("Bearer ", "");

      console.log(`[API] Generating suggestion for job ${jobId}`);

      const result = await agent.generateAndSaveSuggestion(jobId, agentToken);

      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.json({
        success: true,
        jobId,
        suggestion: result.suggestion,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[API] Error: ${msg}`);
      return c.json({ error: msg }, 500);
    }
  });

  return app;
}

export function startApiServer(agent: SuggestionAgent, port: number = 3300): void {
  const app = createApiServer(agent);

  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`[Suggestion Agent] API server running on http://localhost:${info.port}`);
      console.log("[Suggestion Agent] Endpoints:");
      console.log("  GET  /health           - Health check");
      console.log("  GET  /stats            - Get agent stats");
      console.log("  POST /suggest/:jobId   - Generate suggestion for job (requires auth)");
    }
  );
}
