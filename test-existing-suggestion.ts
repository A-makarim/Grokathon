/**
 * Test Suggestion Agent on Existing Job Applications
 * 
 * This test:
 * 1. Finds an existing OPEN job with applications
 * 2. Runs Profile Agent on applications without summaries
 * 3. Runs Suggestion Agent to get recommendation
 * 
 * Use this to test the agents on real data already in the database.
 */

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3100";
const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET || "xbounty-bootstrap-2024";

async function api(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${REGISTRY_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${method} ${path}: ${text}`);
  }
}

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("SUGGESTION AGENT TEST - EXISTING APPLICATIONS");
  console.log("=".repeat(70));

  // 1. Get agent token
  console.log("\n[Step 1] Getting agent token...");
  const tokenRes = await fetch(`${REGISTRY_URL}/users/agent-token`, {
    headers: { "X-Bootstrap-Secret": BOOTSTRAP_SECRET },
  });
  const { token: agentToken } = await tokenRes.json() as { token: string };
  console.log("  ✓ Got agent token");

  // 2. Find an OPEN job with applications
  console.log("\n[Step 2] Finding open jobs with applications...");
  const jobsRes = await api("GET", "/jobs/open");
  const openJobs = jobsRes.jobs || [];
  
  if (openJobs.length === 0) {
    console.log("  ❌ No open jobs found. Create some jobs first!");
    return;
  }

  // Find a job with applications
  let selectedJob: any = null;
  let applications: any[] = [];
  
  for (const job of openJobs) {
    const appsRes = await api("GET", `/applications/job/${job.id}`, undefined, agentToken);
    if (appsRes.applications && appsRes.applications.length >= 2) {
      selectedJob = job;
      applications = appsRes.applications;
      break;
    }
  }

  if (!selectedJob) {
    console.log("  ❌ No open jobs with 2+ applications found.");
    console.log("\n  Available open jobs:");
    for (const job of openJobs.slice(0, 5)) {
      const appsRes = await api("GET", `/applications/job/${job.id}`, undefined, agentToken);
      console.log(`    - ${job.title} (${job.id}): ${appsRes.applications?.length || 0} applications`);
    }
    console.log("\n  Run test-suggestion.ts first to create a job with applications.");
    return;
  }

  console.log(`  ✓ Found job: ${selectedJob.title}`);
  console.log(`    ID: ${selectedJob.id}`);
  console.log(`    Applications: ${applications.length}`);
  console.log(`    Budget: $${selectedJob.budget}`);

  // 3. Show existing applications
  console.log("\n[Step 3] Current Applications:");
  for (const app of applications) {
    const hasSummary = !!app.profileSummary;
    const skillMatch = app.profileSummary?.match(/Skill Match: (\d+%)/)?.[1] || "Not analyzed";
    console.log(`  - @${app.applicant?.twitterHandle || 'unknown'}: ${skillMatch}${hasSummary ? '' : ' (needs analysis)'}`);
  }

  // 4. Run Profile Agent on applications without summaries
  const needsAnalysis = applications.filter((a: any) => !a.profileSummary);
  
  if (needsAnalysis.length > 0) {
    console.log(`\n[Step 4] Running Profile Agent on ${needsAnalysis.length} applications...`);
    const { ProfileAgent } = await import("./profile/src/agent/index.js");
    const profileAgent = new ProfileAgent();

    for (const app of needsAnalysis) {
      const handle = app.applicant?.twitterHandle || 'unknown';
      console.log(`\n  Analyzing @${handle}...`);
      try {
        const summary = await profileAgent.analyzeApplicant(app.applicantId, selectedJob.id);
        await api("PATCH", `/applications/${app.id}/summary`, { summary }, agentToken);
        
        const skillMatch = summary.match(/Skill Match: (\d+%)/)?.[1] || "N/A";
        const recommendation = summary.match(/Recommendation: (HIRE|PASS)/)?.[1] || "N/A";
        console.log(`  ✓ @${handle}: Skill Match ${skillMatch}, Recommendation: ${recommendation}`);
      } catch (err: any) {
        console.log(`  ✗ @${handle} failed: ${err.message}`);
      }
    }
  } else {
    console.log("\n[Step 4] All applications already have summaries ✓");
  }

  // 5. Refresh applications to get updated summaries
  console.log("\n[Step 5] Applications Summary:");
  const refreshedApps = await api("GET", `/applications/job/${selectedJob.id}`, undefined, agentToken);
  applications = refreshedApps.applications || [];
  
  for (const app of applications) {
    const skillMatch = app.profileSummary?.match(/Skill Match: (\d+%)/)?.[1] || "Not analyzed";
    const recommendation = app.profileSummary?.match(/Recommendation: (HIRE|PASS)/)?.[1] || "N/A";
    console.log(`  - @${app.applicant?.twitterHandle}: ${skillMatch} match, ${recommendation}`);
  }

  // 6. Check for existing suggestion
  console.log("\n[Step 6] Checking for existing suggestion...");
  const existingSuggestion = await api("GET", `/suggestions/job/${selectedJob.id}`, undefined, agentToken);
  
  if (existingSuggestion && !existingSuggestion.error) {
    console.log("  ✓ Suggestion already exists:");
    if (existingSuggestion.suggestXai) {
      console.log("    Recommended: xAI Agent");
    } else {
      const recommended = applications.find((a: any) => a.applicantId === existingSuggestion.suggestedApplicantId);
      console.log(`    Recommended: @${recommended?.applicant?.twitterHandle || existingSuggestion.suggestedApplicantId}`);
    }
    console.log(`    Confidence: ${existingSuggestion.confidenceScore}%`);
    
    // Ask if we should regenerate
    console.log("\n  Generating a NEW suggestion anyway...");
  }

  // 7. Run Suggestion Agent
  console.log("\n[Step 7] Running Suggestion Agent...");
  const { SuggestionAgent } = await import("./suggestion/src/agent/index.js");
  const suggestionAgent = new SuggestionAgent();

  const result = await suggestionAgent.generateAndSaveSuggestion(selectedJob.id, agentToken);

  // 8. Show final recommendation
  console.log("\n" + "=".repeat(70));
  console.log("FINAL RECOMMENDATION");
  console.log("=".repeat(70));

  if (result.success && result.suggestion) {
    console.log(`\n📋 Job: ${selectedJob.title}`);
    console.log(`💰 Budget: $${selectedJob.budget}`);
    console.log(`📊 Complexity: ${selectedJob.complexity}`);
    
    if (result.suggestion.recommendXAI) {
      console.log("\n🤖 RECOMMENDATION: xAI Agent (automation)");
    } else if (result.suggestion.applicantId) {
      const recommended = applications.find(
        (a: any) => a.applicantId === result.suggestion?.applicantId
      );
      console.log(`\n👤 RECOMMENDATION: @${recommended?.applicant?.twitterHandle || result.suggestion.applicantId}`);
    } else {
      console.log("\n❌ RECOMMENDATION: No suitable candidate");
    }
    
    console.log(`\n📊 Confidence: ${result.suggestion.confidence}%`);
    console.log(`\n📝 Reasoning:\n${result.suggestion.reasoning}`);
  } else {
    console.log(`\n❌ Failed: ${result.error}`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ TEST COMPLETE");
  console.log("=".repeat(70) + "\n");
}

main().catch(console.error);

