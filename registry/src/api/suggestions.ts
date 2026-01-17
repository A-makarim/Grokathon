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

// Suggestion Agent configuration
const SUGGESTION_AGENT_URL = process.env.SUGGESTION_AGENT_URL || "http://localhost:3300";

/**
 * Trigger suggestion generation for a job
 * This is called asynchronously when a user requests a suggestion
 */
async function triggerSuggestionGeneration(jobId: string): Promise<void> {
  // Get agent token from environment or find an agent user
  let agentToken = process.env.AGENT_TOKEN;

  if (!agentToken) {
    // Try to find an agent user
    const agents = registry.listUsers(0, 100);
    const agent = agents.users.find(u => u.role === "agent");
    if (agent) {
      agentToken = agent.token;
    }
  }

  if (!agentToken) {
    console.warn("[Suggestion Agent] No agent token available, skipping suggestion generation");
    return;
  }

  try {
    const response = await fetch(`${SUGGESTION_AGENT_URL}/suggest/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agentToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).error || `HTTP ${response.status}`);
    }

    await response.json();
    console.log(`[Suggestion Agent] ✓ Suggestion generated for job ${jobId}`);
  } catch (error: unknown) {
    // Log but don't throw - this is async and shouldn't fail the request
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Suggestion Agent] Failed to generate suggestion for job ${jobId}:`, errorMsg);
  }
}

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

  // DEMO MODE: Allow anyone to view suggestions
  // In production, you'd want to enforce: job.createdBy === user.id || user.role === "admin" || user.role === "agent"
  if (job.createdBy !== user.id && user.role !== "admin" && user.role !== "agent") {
    console.log(`[Suggestions API] ⚠️  Demo mode: Allowing user ${user.id} to view suggestion for job created by ${job.createdBy}`);
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

  console.log(`[Suggestions API] Generate suggestion requested by user ${user.id} (${user.name}, role: ${user.role}) for job ${jobId}`);

  const job = registry.getJob(jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  console.log(`[Suggestions API] Job ${jobId} created by ${job.createdBy}, current user: ${user.id}`);

  // DEMO MODE: Allow anyone to generate suggestions for any job
  // In production, you'd want to enforce: job.createdBy === user.id || user.role === "admin" || user.role === "agent"
  // For now, just log the access
  if (job.createdBy !== user.id && user.role !== "admin" && user.role !== "agent") {
    console.log(`[Suggestions API] ⚠️  Demo mode: Allowing user ${user.id} to generate suggestion for job created by ${job.createdBy}`);
  }

  if (job.status !== "OPEN") {
    return c.json({ error: "Job is not open" }, 400);
  }

  // If called by non-agent (job creator), trigger the Suggestion Agent asynchronously
  if (user.role !== "agent") {
    // Trigger suggestion agent in background (don't wait for it)
    triggerSuggestionGeneration(jobId).catch(err => {
      console.error(`[Suggestion Agent] Failed to trigger suggestion for job ${jobId}:`, err);
    });

    return c.json({
      message: "Suggestion generation started. Refresh the page in a few seconds to see the result.",
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
