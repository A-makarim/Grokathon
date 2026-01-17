/**
 * Applications API
 *
 * Job application submission and management.
 */

import { Hono } from "hono";
import { registry } from "./index.js";
import { authMiddleware, agentMiddleware } from "./middleware.js";
import type { CreateApplicationInput, ApplicationStatus } from "../types.js";
import { nanoid } from "nanoid";

export const applicationsApi = new Hono();

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

applicationsApi.use("/*", authMiddleware);

/**
 * Get all applications for a job (job creator only)
 * GET /applications/job/:jobId
 */
applicationsApi.get("/job/:jobId", (c) => {
  const jobId = c.req.param("jobId");
  const user = c.get("user");

  const job = registry.getJob(jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Only job creator or admin can view applications
  if (job.createdBy !== user.id && user.role !== "admin" && user.role !== "agent") {
    return c.json({ error: "Only job creator can view applications" }, 403);
  }

  const applications = registry.listApplicationsByJob(jobId);
  return c.json({ applications, total: applications.length });
});

/**
 * Get my applications
 * GET /applications/me
 */
applicationsApi.get("/me", (c) => {
  const user = c.get("user");

  // Find applicant profile
  let applicant = registry.getApplicant(user.id);
  if (!applicant && user.twitterHandle) {
    applicant = registry.getApplicantByTwitter(user.twitterHandle);
  }

  if (!applicant) {
    return c.json({ applications: [], total: 0 });
  }

  const applications = registry.listApplicationsByApplicant(applicant.id);
  return c.json({ applications, total: applications.length });
});

/**
 * Submit a job application
 * POST /applications
 */
applicationsApi.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json() as { jobId: string; coverLetter?: string };

  if (!body.jobId) {
    return c.json({ error: "jobId is required" }, 400);
  }

  const job = registry.getJob(body.jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (job.status !== "OPEN") {
    return c.json({ error: "Job is not open for applications" }, 400);
  }

  // Find or require applicant profile
  let applicant = registry.getApplicant(user.id);
  if (!applicant && user.twitterHandle) {
    applicant = registry.getApplicantByTwitter(user.twitterHandle);
  }

  if (!applicant) {
    return c.json({ error: "You must create an applicant profile first" }, 400);
  }

  // Check if already applied
  const existingApplications = registry.listApplicationsByJob(body.jobId);
  const alreadyApplied = existingApplications.some(app => app.applicantId === applicant!.id);
  if (alreadyApplied) {
    return c.json({ error: "You have already applied to this job" }, 400);
  }

  try {
    const input: CreateApplicationInput = {
      id: nanoid(),
      jobId: body.jobId,
      applicantId: applicant.id,
      coverLetter: body.coverLetter,
      appliedAt: new Date().toISOString(),
    };

    const application = registry.createApplication(input);
    return c.json(application, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

/**
 * Create application on behalf of an applicant (Agent only)
 * POST /applications/agent
 */
applicationsApi.post("/agent", agentMiddleware, async (c) => {
  const body = await c.req.json() as { 
    jobId: string; 
    applicantId: string; 
    coverLetter?: string;
    profileSummary?: string;
  };

  if (!body.jobId || !body.applicantId) {
    return c.json({ error: "jobId and applicantId are required" }, 400);
  }

  const job = registry.getJob(body.jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (job.status !== "OPEN") {
    return c.json({ error: "Job is not open for applications" }, 400);
  }

  const applicant = registry.getApplicant(body.applicantId);
  if (!applicant) {
    return c.json({ error: "Applicant not found" }, 404);
  }

  // Check if already applied
  const existingApplications = registry.listApplicationsByJob(body.jobId);
  const alreadyApplied = existingApplications.some(app => app.applicantId === body.applicantId);
  if (alreadyApplied) {
    // Return existing application instead of error
    const existing = existingApplications.find(app => app.applicantId === body.applicantId);
    return c.json(existing, 200);
  }

  try {
    const input: CreateApplicationInput = {
      id: nanoid(),
      jobId: body.jobId,
      applicantId: body.applicantId,
      coverLetter: body.coverLetter,
      profileSummary: body.profileSummary,
      appliedAt: new Date().toISOString(),
    };

    const application = registry.createApplication(input);
    return c.json(application, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

/**
 * Update application profile summary (Profile Agent only)
 * PATCH /applications/:id/summary
 */
applicationsApi.patch("/:id/summary", agentMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json() as { summary: string };

  if (!body.summary) {
    return c.json({ error: "summary is required" }, 400);
  }

  const application = registry.getApplication(id);
  if (!application) {
    return c.json({ error: "Application not found" }, 404);
  }

  try {
    registry.updateApplicationSummary(id, body.summary);
    const updated = registry.getApplication(id);
    return c.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

/**
 * Update application status (job creator only)
 * PATCH /applications/:id/status
 */
applicationsApi.patch("/:id/status", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json() as { status: ApplicationStatus };

  if (!body.status) {
    return c.json({ error: "status is required" }, 400);
  }

  const application = registry.getApplication(id);
  if (!application) {
    return c.json({ error: "Application not found" }, 404);
  }

  const job = registry.getJob(application.jobId);
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Only job creator can update application status
  if (job.createdBy !== user.id && user.role !== "admin") {
    return c.json({ error: "Only job creator can update application status" }, 403);
  }

  try {
    registry.updateApplicationStatus(id, body.status);
    const updated = registry.getApplication(id);
    return c.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});
