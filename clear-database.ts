/**
 * Clear Database Script
 * 
 * Removes all jobs and applications from the registry.
 * Run this to start fresh before running the Creation Agent.
 */

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3100";
const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET || "xbounty-bootstrap-2024";

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("CLEARING DATABASE");
  console.log("=".repeat(60));

  // Get agent token
  console.log("\n[1] Getting agent token...");
  const tokenRes = await fetch(`${REGISTRY_URL}/users/agent-token`, {
    headers: { "X-Bootstrap-Secret": BOOTSTRAP_SECRET },
  });
  const { token } = await tokenRes.json() as { token: string };
  console.log("  ✓ Got agent token");

  // Get all jobs
  console.log("\n[2] Fetching all jobs...");
  const openRes = await fetch(`${REGISTRY_URL}/jobs/open?limit=1000`);
  const openData = await openRes.json() as { jobs: Array<{ id: string; title: string }> };
  
  const pendingRes = await fetch(`${REGISTRY_URL}/jobs/pending`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const pendingData = await pendingRes.json() as { jobs: Array<{ id: string; title: string }> };
  
  const allJobs = [...(openData.jobs || []), ...(pendingData.jobs || [])];
  console.log(`  Found ${allJobs.length} jobs`);

  // Cancel all jobs (this effectively removes them from active use)
  console.log("\n[3] Canceling all jobs...");
  let cancelled = 0;
  for (const job of allJobs) {
    try {
      const res = await fetch(`${REGISTRY_URL}/jobs/${job.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        cancelled++;
        console.log(`  ✓ Cancelled: ${job.title.slice(0, 40)}...`);
      } else {
        // Job might already be completed/cancelled
        const data = await res.json();
        console.log(`  ⚠ Skipped: ${job.title.slice(0, 40)}... (${data.error || res.status})`);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${job.id}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`DONE - Cancelled ${cancelled}/${allJobs.length} jobs`);
  console.log("=".repeat(60));
  console.log("\nNote: Jobs are marked as CANCELLED, not deleted.");
  console.log("The Creation Agent will create new jobs from real tweets.\n");
}

main().catch(console.error);

