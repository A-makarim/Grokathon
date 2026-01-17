/**
 * xBounty Job Marketplace Registry Server
 * 
 * Starts the Hono API server for the job marketplace.
 */

import { serve } from "@hono/node-server";
import { api, registry } from "./api/index.js";

const PORT = parseInt(process.env.REGISTRY_PORT || "3100");

// =============================================================================
// BOOTSTRAP - Auto-create admin and agent users on first startup
// =============================================================================

function bootstrap() {
  const { total } = registry.listUsers(0, 1);
  
  if (total > 0) {
    console.log(`[Bootstrap] Found ${total} existing users, skipping bootstrap`);
    
    // Log existing agent token if we have one
    const agents = registry.listUsers(0, 100);
    const agent = agents.users.find(u => u.role === "agent");
    if (agent) {
      console.log(`[Bootstrap] Existing agent token: ${agent.token}`);
    }
    return;
  }
  
  console.log("[Bootstrap] First startup - creating admin and agent users...");
  
  // Create admin user
  const admin = registry.createUser({ 
    name: "Admin", 
    role: "admin",
  });
  console.log(`[Bootstrap] Created admin: ${admin.id}`);
  
  // Create shared agent (used by creation, profile, and suggestion agents)
  const agent = registry.createUser({
    name: "xBountyAgent",
    role: "agent",
  });
  console.log(`[Bootstrap] Created agent: ${agent.id}`);
  
  // Output tokens
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    BOOTSTRAP COMPLETE                              ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  ADMIN_TOKEN=${admin.token}
║  AGENT_TOKEN=${agent.token}
║                                                                    ║
║  Set AGENT_TOKEN in your .env for creation/profile/suggestion      ║
║  agents.                                                           ║
╚═══════════════════════════════════════════════════════════════════╝
`);
}

// Run bootstrap
bootstrap();

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                  xBounty Job Marketplace                           ║
║                      Registry API                                  ║
╠═══════════════════════════════════════════════════════════════════╣
║  Jobs, Applicants, Applications & Suggestions                      ║
║  Database: SQLite (jobs.db)                                        ║
╚═══════════════════════════════════════════════════════════════════╝
`);

serve({
  fetch: api.fetch,
  port: PORT,
}, (info) => {
  console.log(`🚀 Registry API running at http://localhost:${info.port}`);
  console.log(`
API Endpoints:

  Public:
  GET  /                          API info
  GET  /health                    Health check
  GET  /stats                     Registry statistics

  Users:
  POST /users/register            Register (returns token)
  GET  /users/me                  Current user (auth required)
  GET  /users/agent-token         Get agent token (requires bootstrap secret)

  Jobs:
  GET  /jobs/open                 List open jobs
  GET  /jobs/:id                  Get job details
  POST /jobs                      Create job (agent only)
  PATCH /jobs/:id/approve         Approve job with budget
  PATCH /jobs/:id/assign          Assign job to applicant
  PATCH /jobs/:id/complete        Mark job as complete
  PATCH /jobs/:id/cancel          Cancel job

  Applicants:
  GET  /applicants                List applicants
  GET  /applicants/:id            Get applicant profile
  POST /applicants                Create/update applicant profile

  Applications:
  GET  /applications/job/:jobId   Get applications for a job
  POST /applications              Submit application
  PATCH /applications/:id/summary Update profile summary (agent)

  Suggestions:
  GET  /suggestions/job/:jobId    Get suggestion for a job
  POST /suggestions/generate/:id  Generate suggestion (agent)
`);
});
