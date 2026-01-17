/**
 * Jobs API
 *
 * Job CRUD and queries for the job marketplace.
 */

import { Hono } from "hono";
import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { registry } from "./index.js";
import { authMiddleware, agentMiddleware } from "./middleware.js";
import type { CreateJobInput, JobStatus, JobComplexity, Job, User } from "../types.js";
import { nanoid } from "nanoid";

// =============================================================================
// XAI WORK PROCESSING
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

/**
 * Trigger xAI to process a work item
 */
async function triggerXaiWork(workId: string, job: Job): Promise<void> {
  console.log(`[xAI Work] Starting work ${workId} for job ${job.id}`);

  // Update status to in progress
  registry.updateXaiWorkStatus(workId, "IN_PROGRESS");

  try {
    // Build the prompt
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

    const prompt = sections.join("\n");

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

export const jobsApi = new Hono();

/**
 * Extract Twitter handle from a tweet URL
 * e.g., "https://twitter.com/username/status/123" -> "username"
 */
function extractTwitterHandleFromUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/);
  return match ? match[1].toLowerCase() : undefined;
}

/**
 * Check if user is the owner of a job
 * Owner can be determined by:
 * 1. Direct ID match (job.createdBy === user.id)
 * 2. Twitter handle match (user's handle matches the source tweet author)
 */
export function isJobOwner(job: Job, user: User): boolean {
  // Direct ID match
  if (job.createdBy === user.id) return true;
  
  // Twitter handle match from source tweet URL
  const tweetAuthor = extractTwitterHandleFromUrl(job.sourceTweetUrl);
  if (tweetAuthor && user.twitterHandle) {
    const userHandle = user.twitterHandle.replace(/^@/, '').toLowerCase();
    if (tweetAuthor === userHandle) return true;
  }
  
  return false;
}

// =============================================================================
// PUBLIC ENDPOINTS (read-only)
// =============================================================================

/**
 * List open jobs
 * GET /jobs/open?complexity=SIMPLE&limit=50&offset=0
 * 
 * Returns jobs with creator info (name, twitterHandle) when available.
 */
jobsApi.get("/open", (c) => {
  const complexity = c.req.query("complexity")?.split(",") as JobComplexity[] | undefined;
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  const jobs = registry.listJobs({
    status: ["OPEN"],
    complexity,
    limit,
    offset,
  });

  // Enrich jobs with creator info
  const enrichedJobs = jobs.map(job => {
    if (job.createdBy) {
      const creator = registry.getUser(job.createdBy);
      if (creator) {
        return {
          ...job,
          creator: {
            id: creator.id,
            name: creator.name,
            twitterHandle: creator.twitterHandle,
          },
        };
      }
    }
    return job;
  });

  return c.json({ jobs: enrichedJobs, total: enrichedJobs.length });
});

/**
 * List pending jobs (requires auth - for job creators)
 * GET /jobs/pending
 * 
 * NOTE: This route MUST be before /:id to avoid matching "pending" as an id
 */
jobsApi.get("/pending", authMiddleware, (c) => {
  const user = c.get("user");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  // Only show pending jobs created by this user (or all if admin/agent)
  const filters: any = {
    status: ["PENDING_APPROVAL"],
    limit,
    offset,
  };

  if (user.role !== "admin" && user.role !== "agent") {
    filters.createdBy = user.id;
  }

  const jobs = registry.listJobs(filters);
  return c.json({ jobs, total: jobs.length });
});

/**
 * Get a single job
 * GET /jobs/:id
 * 
 * Returns job with creator info (name, twitterHandle) when available.
 */
jobsApi.get("/:id", (c) => {
  const id = c.req.param("id");
  const job = registry.getJob(id);

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Enrich with creator info
  if (job.createdBy) {
    const creator = registry.getUser(job.createdBy);
    if (creator) {
      return c.json({
        ...job,
        creator: {
          id: creator.id,
          name: creator.name,
          twitterHandle: creator.twitterHandle,
        },
      });
    }
  }

  return c.json(job);
});

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

jobsApi.use("/*", authMiddleware);

/**
 * Approve a job and set budget
 * PATCH /jobs/:id/approve
 */
jobsApi.patch("/:id/approve", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json() as { budget: number };

  const job = registry.getJob(id);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (job.status !== "PENDING_APPROVAL") {
    return c.json({ error: "Job is not pending approval" }, 400);
  }

  // Validate budget
  if (!body.budget || body.budget <= 0) {
    return c.json({ error: "Budget must be a positive number" }, 400);
  }

  try {
    registry.approveJob(id, body.budget, user.id);
    const updatedJob = registry.getJob(id);
    return c.json(updatedJob);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

/**
 * Assign a job to an applicant
 * PATCH /jobs/:id/assign
 * 
 * If assigneeId is 'xai' or 'xai-agent', automatically triggers xAI to work on it.
 */
jobsApi.patch("/:id/assign", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json() as { assigneeId: string };

  const job = registry.getJob(id);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Only owner, admin, or agent can assign
  if (!isJobOwner(job, user) && user.role !== "admin" && user.role !== "agent") {
    return c.json({ error: "Only job creator can assign" }, 403);
  }

  if (job.status !== "OPEN") {
    return c.json({ error: "Job is not open" }, 400);
  }

  if (!body.assigneeId) {
    return c.json({ error: "assigneeId is required" }, 400);
  }

  try {
    registry.assignJob(id, body.assigneeId);
    const updatedJob = registry.getJob(id);
    
    // If assigned to xAI, automatically trigger xAI work
    const isXaiAssignment = body.assigneeId === "xai" || body.assigneeId === "xai-agent";
    if (isXaiAssignment && updatedJob) {
      // Create xAI work entry and start async processing
      const work = registry.createXaiWork(id);
      
      // Trigger xAI work processing via internal call
      triggerXaiWork(work.id, updatedJob).catch((err) => {
        console.error(`[Jobs API] Failed to trigger xAI work:`, err);
      });
      
      return c.json({ 
        ...updatedJob, 
        xaiWork: { id: work.id, status: work.status },
        message: "Job assigned to xAI. Work is being processed." 
      });
    }
    
    return c.json(updatedJob);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

/**
 * Mark job as completed
 * PATCH /jobs/:id/complete
 */
jobsApi.patch("/:id/complete", (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const job = registry.getJob(id);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Only owner, admin, or agent can mark complete
  if (!isJobOwner(job, user) && user.role !== "admin" && user.role !== "agent") {
    return c.json({ error: "Only job creator can mark complete" }, 403);
  }

  if (job.status !== "IN_PROGRESS") {
    return c.json({ error: "Job is not in progress" }, 400);
  }

  try {
    registry.completeJob(id);
    const updatedJob = registry.getJob(id);
    return c.json(updatedJob);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

/**
 * Cancel a job
 * PATCH /jobs/:id/cancel
 */
jobsApi.patch("/:id/cancel", (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const job = registry.getJob(id);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Owner, admin, or agent can cancel
  if (!isJobOwner(job, user) && user.role !== "admin" && user.role !== "agent") {
    return c.json({ error: "Only job creator can cancel" }, 403);
  }

  if (job.status === "COMPLETED" || job.status === "CANCELLED") {
    return c.json({ error: "Job is already completed or cancelled" }, 400);
  }

  try {
    registry.cancelJob(id);
    const updatedJob = registry.getJob(id);
    return c.json(updatedJob);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

// =============================================================================
// AGENT ENDPOINTS (requires agent or admin role)
// =============================================================================

jobsApi.use("/*", agentMiddleware);

/**
 * Create a new job (agent only - from job creation agent)
 * POST /jobs
 * 
 * Jobs are auto-approved with a default budget based on complexity.
 */
jobsApi.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json() as CreateJobInput & { budget?: number };

  // Validate required fields
  if (!body.title || body.title.trim().length === 0) {
    return c.json({ error: "Title is required" }, 400);
  }

  if (!body.description || body.description.trim().length === 0) {
    return c.json({ error: "Description is required" }, 400);
  }

  try {
    const input: CreateJobInput = {
      id: body.id || nanoid(),
      title: body.title,
      description: body.description,
      requirements: body.requirements,
      complexity: body.complexity,
      sourceTweetId: body.sourceTweetId,
      sourceTweetUrl: body.sourceTweetUrl,
      createdAt: new Date().toISOString(),
    };

    const job = registry.createJob(input);
    
    // Auto-approve with default budget based on complexity
    const defaultBudgets: Record<string, number> = {
      SIMPLE: 250,
      MODERATE: 500,
      COMPLEX: 1000,
    };
    const budget = body.budget || defaultBudgets[body.complexity || "MODERATE"] || 500;
    registry.approveJob(job.id, budget, user.id);
    
    const approvedJob = registry.getJob(job.id);
    return c.json(approvedJob, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});
