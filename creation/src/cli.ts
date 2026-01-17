/**
 * xBounty - Creation Agent CLI
 *
 * Generates jobs and submits them to the Registry API.
 * The agent itself checks for duplicates via the searchExistingJobs tool.
 */

import { CONFIG, validateConfig } from "./config/index.js";
import { CreationAgent } from "./agent/index.js";
import type { Job } from "./types/index.js";
import {
  configureRegistry,
  getRegistryStats as fetchRegistryStats,
  isRegistryHealthy,
} from "@xbounty/common";

const DIVIDER = "─".repeat(70);
const DOUBLE_DIVIDER = "═".repeat(70);

// Registry API configuration
const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3100";
const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET || "xbounty-bootstrap-2024";
let AGENT_TOKEN = process.env.AGENT_TOKEN;

/**
 * Fetch agent token from registry if not set
 */
async function ensureAgentToken(): Promise<void> {
  if (AGENT_TOKEN) return;
  
  console.log("[xBounty] AGENT_TOKEN not set, fetching from registry...");
  
  try {
    const response = await fetch(`${REGISTRY_URL}/users/agent-token`, {
      headers: { "X-Bootstrap-Secret": BOOTSTRAP_SECRET },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json() as { token: string; agentId: string };
    AGENT_TOKEN = data.token;
    configureRegistry({ url: REGISTRY_URL, token: AGENT_TOKEN });
    console.log(`[xBounty] Got agent token for ${data.agentId}`);
  } catch (err) {
    console.error("[ERROR] Failed to fetch agent token:", err);
    console.error("[ERROR] Set AGENT_TOKEN env var or ensure registry is running");
    process.exit(1);
  }
}

// Configure the registry client (used by agent's searchExistingJobs tool)
configureRegistry({ url: REGISTRY_URL, token: AGENT_TOKEN });

function formatJob(job: Job, index: number): string {
  const lines: string[] = [
    "",
    DIVIDER,
    `JOB #${index + 1}  |  ${job.id}`,
    DIVIDER,
    "",
    `  Title:        ${job.title}`,
    `  Description:  ${job.description}`,
    "",
  ];

  if (job.requirements) {
    lines.push(`  Requirements: ${job.requirements}`, "");
  }

  if (job.complexity) {
    lines.push(`  Complexity:   ${job.complexity}`);
  }

  if (job.sourceTweetUrl) {
    lines.push(`  Source:       ${job.sourceTweetUrl}`);
  }

  if (job.tags && job.tags.length > 0) {
    lines.push(`  Tags:         ${job.tags.join(", ")}`);
  }

  return lines.join("\n");
}

/**
 * Submit job to Registry API
 */
async function submitJobToRegistry(job: Job): Promise<{ success: boolean; error?: string }> {
  if (!AGENT_TOKEN) {
    return { success: false, error: "AGENT_TOKEN not set. Get one from registry admin." };
  }

  try {
    const response = await fetch(`${REGISTRY_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AGENT_TOKEN}`,
      },
      body: JSON.stringify({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        complexity: job.complexity,
        sourceTweetId: job.sourceTweetId,
        sourceTweetUrl: job.sourceTweetUrl,
        tags: job.tags,
        createdAt: job.createdAt,
        // Note: status will be PENDING_APPROVAL by default in the API
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Submit jobs to Registry API
 * Note: The agent already checks for duplicates via searchExistingJobs tool
 */
async function submitJobsToRegistry(jobs: Job[]): Promise<{ saved: number; failed: number }> {
  console.log(`[Registry] Submitting ${jobs.length} job(s)...`);

  let saved = 0;
  let failed = 0;

  for (const job of jobs) {
    const result = await submitJobToRegistry(job);
    if (result.success) {
      saved++;
      console.log(`  ✓ Created: ${job.id.slice(0, 8)}... "${job.title.slice(0, 50)}..."`);
    } else {
      failed++;
      // Registry returns "already exists" if duplicate - that's fine, agent should have avoided it
      console.log(`  ✗ Failed: ${job.id.slice(0, 8)}... - ${result.error}`);
    }
  }

  return { saved, failed };
}

/**
 * Get registry stats (uses common tool)
 */
async function getRegistryStats(): Promise<{ totalJobs: number; openJobs: number; pendingJobs: number } | null> {
  const result = await fetchRegistryStats();
  if (result.error || !result.stats) return null;
  return {
    totalJobs: result.stats.totalJobs || 0,
    openJobs: result.stats.openJobs || 0,
    pendingJobs: result.stats.pendingJobs || 0,
  };
}

async function onJobsGenerated(jobs: Job[]): Promise<void> {
  console.log("\n" + DOUBLE_DIVIDER);
  console.log(`  GENERATED ${jobs.length} JOBS`);
  console.log(DOUBLE_DIVIDER);

  jobs.forEach((job, index) => {
    console.log(formatJob(job, index));
  });

  // Submit to registry (agent already checked for duplicates)
  console.log("\n" + DIVIDER);
  console.log("  SUBMITTING TO REGISTRY");
  console.log(DIVIDER);

  const { saved, failed } = await submitJobsToRegistry(jobs);

  console.log(`\n  Summary:`);
  console.log(`    ✓ Created:  ${saved} jobs`);
  if (failed > 0) {
    console.log(`    ✗ Failed:   ${failed} jobs`);
  }

  // Show registry stats
  const stats = await getRegistryStats();
  if (stats) {
    console.log("\n  Registry Stats:");
    console.log(`    Total Jobs:     ${stats.totalJobs}`);
    console.log(`    Pending Jobs:   ${stats.pendingJobs}`);
    console.log(`    Open Jobs:      ${stats.openJobs}`);
  }

  console.log("\n" + DOUBLE_DIVIDER);
}

const USAGE = `
xBounty - Job Creation Agent

USAGE
  pnpm generate           Start continuous job generation
  pnpm generate:once      Generate jobs once and exit

ENVIRONMENT
  XAI_API_KEY             Required. Your xAI API key.
  REGISTRY_URL            Registry API URL (default: http://localhost:3100)
  AGENT_TOKEN             Optional. Auto-fetched from registry if not set.
  BOOTSTRAP_SECRET        Secret for auto-fetching token (default: xbounty-bootstrap-2024)
  GENERATION_INTERVAL_MS  Interval between generations (default: 3600000ms)
  MAX_JOBS_PER_RUN        Jobs per generation cycle (default: 5)

EXAMPLE
  XAI_API_KEY=xxx pnpm generate:once
`;

async function runGenerate(once: boolean): Promise<void> {
  // Check registry is reachable
  console.log(`[xBounty] Registry URL: ${REGISTRY_URL}`);
  
  const healthy = await isRegistryHealthy();
  if (!healthy) {
    console.error(`[ERROR] Cannot reach registry at ${REGISTRY_URL}`);
    console.error("[ERROR] Start the registry first: cd registry && pnpm start");
    process.exit(1);
  }
  
  // Ensure we have an agent token
  await ensureAgentToken();

  const stats = await getRegistryStats();
  console.log(`[xBounty] Registry connected. ${stats?.totalJobs ?? 0} jobs total, ${stats?.pendingJobs ?? 0} pending, ${stats?.openJobs ?? 0} open.\n`);

  const agent = new CreationAgent();

  if (once) {
    console.log("[xBounty] Running single generation cycle\n");
    const jobs = await agent.runGenerationCycle();
    await onJobsGenerated(jobs);
  } else {
    console.log("[xBounty] Starting continuous generation");
    console.log(`[xBounty] Interval: ${CONFIG.generation.intervalMs / 1000}s`);
    console.log("[xBounty] Press Ctrl+C to stop\n");

    const stop = agent.startPeriodicGeneration(
      CONFIG.generation.intervalMs,
      async (jobs) => {
        await onJobsGenerated(jobs);
      }
    );

    process.on("SIGINT", () => { stop(); process.exit(0); });
    process.on("SIGTERM", () => { stop(); process.exit(0); });
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command && command !== "help" && command !== "--help") {
    try {
      validateConfig();
    } catch (error) {
      console.error("[ERROR]", error);
      process.exit(1);
    }
  }

  switch (command) {
    case "generate":
      await runGenerate(args.includes("--once"));
      break;
    default:
      console.log(USAGE);
      break;
  }
}

main().catch((error) => {
  console.error("[FATAL]", error.message || error);
  process.exit(1);
});
