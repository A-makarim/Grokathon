/**
 * Applicants API
 *
 * Applicant profile management.
 */

import { Hono } from "hono";
import { registry } from "./index.js";
import { authMiddleware } from "./middleware.js";
import type { CreateApplicantInput } from "../types.js";
import { nanoid } from "nanoid";

export const applicantsApi = new Hono();

// =============================================================================
// PUBLIC ENDPOINTS (read-only, must come before auth middleware)
// =============================================================================

/**
 * Get applicant profile by ID (public)
 * GET /applicants/:id
 */
applicantsApi.get("/:id", (c) => {
  const id = c.req.param("id");
  
  // Skip if this looks like a special route that should be handled by auth routes
  if (id === "me") {
    return c.json({ error: "Use authenticated route for /me" }, 401);
  }
  
  const applicant = registry.getApplicant(id);

  if (!applicant) {
    return c.json({ error: "Applicant not found" }, 404);
  }

  return c.json({ applicant });
});

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

applicantsApi.use("/*", authMiddleware);

/**
 * Get my applicant profile
 * GET /applicants/me
 */
applicantsApi.get("/me", (c) => {
  const user = c.get("user");

  // Try to find applicant by user ID (assuming applicant ID = user ID)
  let applicant = registry.getApplicant(user.id);

  // If not found by ID, try by Twitter handle
  if (!applicant && user.twitterHandle) {
    applicant = registry.getApplicantByTwitter(user.twitterHandle);
  }

  if (!applicant) {
    return c.json({ error: "Applicant profile not found. Create one first." }, 404);
  }

  return c.json({ applicant });
});

/**
 * List all applicants (admin/agent only)
 * GET /applicants
 */
applicantsApi.get("/", (c) => {
  const user = c.get("user");
  
  // Only admin/agent can list all applicants
  if (user.role !== "admin" && user.role !== "agent") {
    return c.json({ error: "Not authorized" }, 403);
  }

  const applicants = registry.listApplicants({});
  return c.json({ applicants, total: applicants.length });
});

/**
 * Create applicant profile
 * POST /applicants
 */
applicantsApi.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json() as Partial<CreateApplicantInput>;

  // Validate required fields
  if (!body.name || body.name.trim().length === 0) {
    return c.json({ error: "Name is required" }, 400);
  }

  try {
    const input: CreateApplicantInput = {
      id: user.id, // Use user ID as applicant ID
      name: body.name,
      email: body.email,
      twitterHandle: body.twitterHandle || user.twitterHandle || undefined,
      bio: body.bio,
      skills: body.skills || [],
      portfolioUrl: body.portfolioUrl,
      avatarUrl: body.avatarUrl,
      createdAt: new Date().toISOString(),
    };

    const applicant = registry.createApplicant(input);
    return c.json({ applicant }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

/**
 * Update my applicant profile
 * PATCH /applicants/me
 */
applicantsApi.patch("/me", async (c) => {
  const user = c.get("user");
  const body = await c.req.json() as Partial<CreateApplicantInput>;

  // Find applicant
  let applicant = registry.getApplicant(user.id);
  if (!applicant && user.twitterHandle) {
    applicant = registry.getApplicantByTwitter(user.twitterHandle);
  }

  if (!applicant) {
    return c.json({ error: "Applicant profile not found. Create one first." }, 404);
  }

  try {
    registry.updateApplicant(applicant.id, {
      name: body.name,
      email: body.email,
      bio: body.bio,
      skills: body.skills,
      portfolioUrl: body.portfolioUrl,
      avatarUrl: body.avatarUrl,
    });

    const updatedApplicant = registry.getApplicant(applicant.id);
    return c.json({ applicant: updatedApplicant });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});
