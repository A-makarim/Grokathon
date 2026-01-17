/**
 * Profile Agent API Server
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ProfileAgent } from "../agent/index.js";

const app = new Hono();
const agent = new ProfileAgent();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "profile-agent",
    timestamp: new Date().toISOString(),
  });
});

// Analyze applicant profile
app.post("/profile/analyze", async (c) => {
  try {
    const body = await c.req.json() as {
      applicantId: string;
      jobId: string;
      applicationId?: string;
      agentToken?: string;
    };

    const { applicantId, jobId, applicationId, agentToken } = body;

    if (!applicantId || !jobId) {
      return c.json({ error: "applicantId and jobId are required" }, 400);
    }

    // If applicationId and agentToken provided, analyze and update
    if (applicationId && agentToken) {
      const result = await agent.analyzeAndUpdateApplication(
        applicationId,
        applicantId,
        jobId,
        agentToken
      );

      if (result.success) {
        return c.json({
          success: true,
          summary: result.summary,
          applicationId,
        });
      } else {
        return c.json({ error: result.error }, 500);
      }
    }

    // Otherwise just analyze and return
    const summary = await agent.analyzeApplicant(applicantId, jobId);

    return c.json({
      success: true,
      summary,
      applicantId,
      jobId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[API Error]", message);
    return c.json({ error: message }, 500);
  }
});

export { app };
