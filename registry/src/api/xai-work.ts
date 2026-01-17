/**
 * xAI Work API
 *
 * Endpoints for managing xAI work - triggering, retrieving, and monitoring
 * AI-generated work output for jobs assigned to xAI.
 */

import { Hono } from "hono";
import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { registry } from "./index.js";
import { authMiddleware, agentMiddleware } from "./middleware.js";
import type { XaiWork } from "../types.js";

export const xaiWorkApi = new Hono();

// =============================================================================
// SYSTEM PROMPT FOR XAI WORK
// =============================================================================

const XAI_WORK_SYSTEM_PROMPT = `You are an AI agent powered by xAI (Grok) that completes bounty tasks.

When given a job/bounty, you will:
1. Analyze the task requirements carefully
2. Break down the work into clear steps
3. Execute the work to the best of your ability
4. Produce high-quality deliverables

Your output should be:
- Clear and well-structured
- Directly addressing the task requirements
- Professional and thorough
- Include any code, text, or analysis as requested

Format your response as a detailed work output that the job poster can review and use.`;

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

// =============================================================================
// ASYNC PROCESSING
// =============================================================================

interface JobData {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  budget: number | null;
  complexity: string | null;
}

/**
 * Process xAI work asynchronously using Grok
 */
async function processXaiWork(workId: string, job: JobData): Promise<void> {
  console.log(`[xAI Work] Starting work ${workId} for job ${job.id}`);

  // Update status to in progress
  registry.updateXaiWorkStatus(workId, "IN_PROGRESS");

  try {
    // Build the prompt
    const prompt = buildWorkPrompt(job);

    // Call xAI (Grok) to generate the work output
    const result = await generateText({
      model: xai(process.env.XAI_MODEL || "grok-3-mini"),
      system: XAI_WORK_SYSTEM_PROMPT,
      prompt,
      maxTokens: 4000,
      providerOptions: {
        xai: {
          // Enable Live Search for research-heavy tasks
          searchParameters: {
            mode: "auto",
            returnCitations: true,
            maxSearchResults: 10,
            sources: [
              { type: "web", safeSearch: true },
              { type: "news", safeSearch: true },
            ],
          },
        },
      },
    });

    const output = result.text;
    
    // Extract any sources/citations as artifacts
    const artifacts: string[] = [];
    if (result.sources && result.sources.length > 0) {
      for (const source of result.sources) {
        if (source.url) {
          artifacts.push(source.url);
        }
      }
    }

    // Build execution notes
    const executionNotes = [
      `Model: ${process.env.XAI_MODEL || "grok-3-mini"}`,
      `Generated at: ${new Date().toISOString()}`,
      result.sources?.length ? `Sources used: ${result.sources.length}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Save the output
    registry.saveXaiWorkOutput(workId, output, artifacts, executionNotes);

    console.log(`[xAI Work] Completed work ${workId}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[xAI Work] Failed work ${workId}:`, errorMessage);
    registry.saveXaiWorkError(workId, errorMessage);
  }
}

/**
 * Build the work prompt from job data
 */
function buildWorkPrompt(job: JobData): string {
  const sections: string[] = [];

  sections.push(`# Task: ${job.title}`);
  sections.push("");
  sections.push(`## Description`);
  sections.push(job.description);

  if (job.requirements) {
    sections.push("");
    sections.push(`## Requirements`);
    sections.push(job.requirements);
  }

  if (job.complexity) {
    sections.push("");
    sections.push(`## Complexity Level: ${job.complexity}`);
  }

  if (job.budget) {
    sections.push("");
    sections.push(`## Budget: $${job.budget}`);
  }

  sections.push("");
  sections.push(`---`);
  sections.push("");
  sections.push(`Please complete this task to the best of your ability. Provide detailed, high-quality output that directly addresses all requirements. Structure your response clearly with sections and formatting as appropriate for the task type.`);

  return sections.join("\n");
}
