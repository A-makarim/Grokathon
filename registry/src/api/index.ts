/**
 * xBounty Job Marketplace Registry API
 * 
 * Hono-based REST API for the job marketplace.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { JobRegistry } from "../registry.js";
import { usersApi } from "./users.js";
import { jobsApi } from "./jobs.js";
import { applicantsApi } from "./applicants.js";
import { applicationsApi } from "./applications.js";
import { suggestionsApi } from "./suggestions.js";

// =============================================================================
// SETUP
// =============================================================================

// Database path - use /app/data in production (Docker volume), local file otherwise
const DB_PATH = process.env.DATABASE_PATH || 
  (process.env.NODE_ENV === "production" ? "/app/data/jobs.db" : "jobs.db");

// Shared registry instance
export const registry = new JobRegistry(DB_PATH);

console.log(`[Registry] Database: ${DB_PATH}`);

// Main API app
export const api = new Hono();

// Global middleware
api.use("*", cors());
api.use("*", logger());

// =============================================================================
// ROUTES
// =============================================================================

// Health & stats (no auth required)
api.get("/", (c) => c.json({ 
  name: "xBounty Job Marketplace", 
  version: "2.0.0",
  docs: "https://github.com/xbounty/registry",
}));

api.get("/health", (c) => c.json({ 
  status: "ok", 
  timestamp: new Date().toISOString() 
}));

api.get("/stats", (c) => {
  const stats = registry.getStats();
  return c.json(stats);
});

// Mount sub-routers
api.route("/users", usersApi);
api.route("/jobs", jobsApi);
api.route("/applicants", applicantsApi);
api.route("/applications", applicationsApi);
api.route("/suggestions", suggestionsApi);
