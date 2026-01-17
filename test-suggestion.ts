/**
 * Test Suggestion Agent
 * 
 * This test:
 * 1. Creates a new job
 * 2. Has madebykeef and keerthanenr apply to it
 * 3. Runs Profile Agent to create summaries
 * 4. Runs Suggestion Agent to recommend who should do the job
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
  console.log("SUGGESTION AGENT TEST");
  console.log("=".repeat(70));

  // 1. Get agent token
  console.log("\n[Step 1] Getting agent token...");
  const tokenRes = await fetch(`${REGISTRY_URL}/users/agent-token`, {
    headers: { "X-Bootstrap-Secret": BOOTSTRAP_SECRET },
  });
  const { token: agentToken } = await tokenRes.json() as { token: string };
  console.log("  ✓ Got agent token");

  // 2. Get existing applicants (madebykeef and keerthanenr)
  console.log("\n[Step 2] Finding existing applicants...");
  const applicantsRes = await api("GET", "/applicants", undefined, agentToken);
  const allApplicants = applicantsRes.applicants || [];
  
  let madebykeef = allApplicants.find((a: any) => a.twitterHandle === "madebykeef");
  let keerthanenr = allApplicants.find((a: any) => a.twitterHandle === "keerthanenr");
  
  // Create them if they don't exist
  if (!madebykeef) {
    console.log("  Creating @madebykeef...");
    const user = await api("POST", "/users/register", { name: "Keef Designer" });
    const result = await api("POST", "/applicants", {
      name: "Keef Designer",
      email: `madebykeef_${Date.now()}@test.com`,
      twitterHandle: "madebykeef",
      bio: "Graphic designer specializing in posters, branding, and visual design. 5+ years of experience creating stunning visuals for tech companies and hackathons.",
      skills: ["graphic-design", "photoshop", "illustrator", "branding", "poster-design", "illustration"],
    }, user.token);
    madebykeef = result.applicant || result;
  }
  console.log(`  ✓ @madebykeef: ${madebykeef.id}`);
  
  if (!keerthanenr) {
    console.log("  Creating @keerthanenr...");
    const user = await api("POST", "/users/register", { name: "Keerthanen R" });
    const result = await api("POST", "/applicants", {
      name: "Keerthanen R",
      email: `keerthanenr_${Date.now()}@test.com`,
      twitterHandle: "keerthanenr",
      bio: "Software engineer focused on AI and backend development. Building cool things with TypeScript and Python.",
      skills: ["development", "ai", "backend", "python", "typescript", "nodejs"],
    }, user.token);
    keerthanenr = result.applicant || result;
  }
  console.log(`  ✓ @keerthanenr: ${keerthanenr.id}`);

  // 3. Create a new job for this test
  console.log("\n[Step 3] Creating a new job...");
  const job = await api("POST", "/jobs", {
    title: "Graphic Designer for AI Hackathon Poster",
    description: "Create a visually stunning poster for our AI hackathon. Must incorporate futuristic AI themes, bold typography, and eye-catching visuals that attract developers and designers.",
    requirements: "Graphic design skills, Photoshop/Illustrator proficiency, experience with poster design and branding",
    complexity: "MODERATE",
    sourceTweetId: `test_${Date.now()}`,
    sourceTweetUrl: `https://twitter.com/test/status/test_${Date.now()}`,
  }, agentToken);
  console.log(`  ✓ Created job: ${job.id}`);
  console.log(`    Title: ${job.title}`);
  
  // Approve the job
  await api("PATCH", `/jobs/${job.id}/approve`, { budget: 1000 }, agentToken);
  console.log("  ✓ Approved job with $1000 budget");

  // 4. Create applications for both applicants
  console.log("\n[Step 4] Creating applications...");
  
  const app1 = await api("POST", "/applications/agent", {
    jobId: job.id,
    applicantId: madebykeef.id,
    coverLetter: "I'm a graphic designer with 5+ years of experience in poster design, branding, and visual identity. I've created hackathon posters before and love working with AI/tech themes! My portfolio showcases my ability to blend futuristic aesthetics with clean, impactful design.",
  }, agentToken);
  console.log(`  ✓ @madebykeef applied: ${app1.id}`);
  
  const app2 = await api("POST", "/applications/agent", {
    jobId: job.id,
    applicantId: keerthanenr.id,
    coverLetter: "I'm a software engineer passionate about AI. While I'm not primarily a designer, I understand tech themes deeply and can provide input on technical accuracy. I'm eager to try my hand at design!",
  }, agentToken);
  console.log(`  ✓ @keerthanenr applied: ${app2.id}`);

  // 5. Run Profile Agent on each application
  console.log("\n[Step 5] Running Profile Agent to analyze applicants...");
  const { ProfileAgent } = await import("./profile/src/agent/index.js");
  const profileAgent = new ProfileAgent();

  const applicationsToAnalyze = [
    { handle: "madebykeef", appId: app1.id, applicantId: madebykeef.id },
    { handle: "keerthanenr", appId: app2.id, applicantId: keerthanenr.id },
  ];

  for (const { handle, appId, applicantId } of applicationsToAnalyze) {
    console.log(`\n  Analyzing @${handle}...`);
    try {
      const summary = await profileAgent.analyzeApplicant(applicantId, job.id);
      await api("PATCH", `/applications/${appId}/summary`, { summary }, agentToken);
      
      // Extract key metrics
      const skillMatch = summary.match(/Skill Match: (\d+%)/)?.[1] || "N/A";
      const recommendation = summary.match(/Recommendation: (HIRE|PASS)/)?.[1] || "N/A";
      console.log(`  ✓ @${handle}: Skill Match ${skillMatch}, Recommendation: ${recommendation}`);
    } catch (err: any) {
      console.log(`  ✗ @${handle} failed: ${err.message}`);
    }
  }

  // 6. Show applications summary
  console.log("\n[Step 6] Applications Summary:");
  const apps = await api("GET", `/applications/job/${job.id}`, undefined, agentToken);
  console.log(`  Total applications: ${apps.applications?.length || 0}`);
  
  for (const app of (apps.applications || [])) {
    const skillMatch = app.profileSummary?.match(/Skill Match: (\d+%)/)?.[1] || "Not analyzed";
    const recommendation = app.profileSummary?.match(/Recommendation: (HIRE|PASS)/)?.[1] || "N/A";
    console.log(`  - @${app.applicant?.twitterHandle}: ${skillMatch} match, ${recommendation}`);
  }

  // 7. Run Suggestion Agent
  console.log("\n[Step 7] Running Suggestion Agent...");
  const { SuggestionAgent } = await import("./suggestion/src/agent/index.js");
  const suggestionAgent = new SuggestionAgent();

  const result = await suggestionAgent.generateAndSaveSuggestion(job.id, agentToken);

  // 8. Show final recommendation
  console.log("\n" + "=".repeat(70));
  console.log("FINAL RECOMMENDATION");
  console.log("=".repeat(70));

  if (result.success && result.suggestion) {
    if (result.suggestion.recommendXAI) {
      console.log("\n🤖 RECOMMENDATION: xAI Agent (automation)");
    } else if (result.suggestion.applicantId) {
      const recommended = apps.applications?.find(
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
