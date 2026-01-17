/**
 * xAI Work API
 *
 * Endpoints for managing xAI work - triggering, retrieving, and monitoring
 * AI-generated work output for jobs assigned to xAI.
 */

import { Hono } from "hono";
import { registry } from "./index.js";
import { authMiddleware } from "./middleware.js";
import { processXaiWork } from "./xai-processor.js";
import type { XaiWork } from "../types.js";

export const xaiWorkApi = new Hono();

// =============================================================================
// PUBLIC ENDPOINTS (read-only)
// =============================================================================

/**
 * Get xAI work for a job
 * GET /xai-work/job/:jobId
 */
xaiWorkApi.get("/job/:jobId", (c) => {
  const jobId = c.req.param("jobId");
  const work = registry.getXaiWorkByJob(jobId);

  if (!work) {
    return c.json({ error: "No xAI work found for this job" }, 404);
  }

  return c.json({ work });
});

/**
 * Get xAI work by ID
 * GET /xai-work/:id
 */
xaiWorkApi.get("/:id", (c) => {
  const id = c.req.param("id");
  const work = registry.getXaiWork(id);

  if (!work) {
    return c.json({ error: "xAI work not found" }, 404);
  }

  return c.json({ work });
});

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

xaiWorkApi.use("/*", authMiddleware);

/**
 * Trigger xAI to start working on a job
 * POST /xai-work/trigger/:jobId
 * 
 * This endpoint:
 * 1. Creates a new xAI work entry
 * 2. Starts the AI processing asynchronously
 * 3. Returns immediately with work ID for polling
 */
xaiWorkApi.post("/trigger/:jobId", async (c) => {
  const jobId = c.req.param("jobId");

  const job = registry.getJob(jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Check if job is assigned to xAI
  if (job.assignedTo !== "xai" && job.assignedTo !== "xai-agent") {
    return c.json({ error: "Job is not assigned to xAI" }, 400);
  }

  // Check if work already exists
  let work = registry.getXaiWorkByJob(jobId);
  if (work) {
    // If already completed or in progress, return existing
    if (work.status === "COMPLETED" || work.status === "IN_PROGRESS") {
      return c.json({ work, message: "Work already exists" });
    }
    // If pending or failed, we can retry
  } else {
    // Create new work entry
    work = registry.createXaiWork(jobId);
  }

  // Start async processing
  processXaiWork(work.id, job).catch((err) => {
    console.error(`[xAI Work] Failed to process work ${work!.id}:`, err);
  });

  return c.json({ work, message: "xAI work started" }, 202);
});

/**
 * Retry failed xAI work
 * POST /xai-work/:id/retry
 */
xaiWorkApi.post("/:id/retry", async (c) => {
  const id = c.req.param("id");

  const work = registry.getXaiWork(id);
  if (!work) {
    return c.json({ error: "xAI work not found" }, 404);
  }

  if (work.status !== "FAILED") {
    return c.json({ error: "Can only retry failed work" }, 400);
  }

  const job = registry.getJob(work.jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Reset status and start processing
  registry.updateXaiWorkStatus(id, "PENDING");

  processXaiWork(id, job).catch((err) => {
    console.error(`[xAI Work] Failed to retry work ${id}:`, err);
  });

  return c.json({ message: "xAI work retry started" }, 202);
});
