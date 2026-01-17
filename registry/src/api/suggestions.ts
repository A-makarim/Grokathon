/**
 * Suggestions API
 *
 * AI-powered hiring suggestions.
 */

import { Hono } from "hono";
import { registry } from "./index.js";
import { authMiddleware } from "./middleware.js";
import type { CreateSuggestionInput } from "../types.js";
import { nanoid } from "nanoid";

export const suggestionsApi = new Hono();

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

suggestionsApi.use("/*", authMiddleware);

/**
 * Get suggestion for a job
 * GET /suggestions/job/:jobId
 */
suggestionsApi.get("/job/:jobId", (c) => {
  const jobId = c.req.param("jobId");
  const user = c.get("user");

  const job = registry.getJob(jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Only job creator or admin can view suggestions
  if (job.createdBy !== user.id && user.role !== "admin" && user.role !== "agent") {
    return c.json({ error: "Only job creator can view suggestions" }, 403);
  }

  const suggestion = registry.getSuggestionByJob(jobId);
  if (!suggestion) {
    return c.json({ error: "No suggestion found for this job" }, 404);
  }

  return c.json(suggestion);
});

/**
 * Generate/create a suggestion for a job
 * POST /suggestions/generate/:jobId
 *
 * This endpoint is typically called by the Suggestion Agent after analysis,
 * or can be triggered by the job creator to request a new suggestion.
 */
suggestionsApi.post("/generate/:jobId", async (c) => {
  const jobId = c.req.param("jobId");
  const user = c.get("user");
  const body = await c.req.json() as Partial<CreateSuggestionInput>;

  const job = registry.getJob(jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Only job creator, agent, or admin can generate suggestions
  if (job.createdBy !== user.id && user.role !== "admin" && user.role !== "agent") {
    return c.json({ error: "Only job creator can generate suggestions" }, 403);
  }

  if (job.status !== "OPEN") {
    return c.json({ error: "Job is not open" }, 400);
  }

  // If called by non-agent (job creator), return a message to wait for agent processing
  // In production, this would trigger the Suggestion Agent asynchronously
  if (user.role !== "agent" && user.role !== "admin") {
    return c.json({
      message: "Suggestion generation requested. The Suggestion Agent will process this shortly.",
      jobId,
    }, 202);
  }

  // Agent is creating the suggestion directly
  if (!body.reasoning || body.confidenceScore === undefined) {
    return c.json({ error: "reasoning and confidenceScore are required" }, 400);
  }

  try {
    const input: CreateSuggestionInput = {
      id: nanoid(),
      jobId,
      suggestedApplicantId: body.suggestedApplicantId,
      suggestXai: body.suggestXai || false,
      reasoning: body.reasoning,
      confidenceScore: body.confidenceScore,
      createdAt: new Date().toISOString(),
    };

    const suggestion = registry.createSuggestion(input);
    return c.json(suggestion, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});
