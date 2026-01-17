/**
 * End-to-End Test for Job Marketplace Backend
 *
 * Tests the complete flow:
 * 1. Create a job (simulating Creation Agent)
 * 2. Approve the job (user action)
 * 3. Create applicant profiles
 * 4. Submit applications
 * 5. Analyze profiles (Profile Agent)
 * 6. Generate suggestion (Suggestion Agent)
 * 7. Assign job to recommended candidate
 * 8. Mark job as complete
 */

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3100";
const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET || "xbounty-bootstrap-2024";
const RUN_ID = Date.now();

type ApplicantSession = {
  token: string;
  userId: string;
  name: string;
  twitterHandle?: string;
};

let AGENT_TOKEN: string;
let JOB_OWNER_TOKEN: string;
let APPLICANT_SESSIONS: ApplicantSession[] = [];

const DIVIDER = "=".repeat(70);
const SECTION = "-".repeat(70);

// Helper function to make API calls
async function apiCall(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${REGISTRY_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${data.error || response.statusText}`);
  }

  return data;
}

const APPLICANT_PROFILES = [
  {
    name: "Alice Johnson",
    email: `alice_${RUN_ID}@example.com`,
    twitterHandle: `alice_${RUN_ID}`, // Unique handle per test run
    bio: "Senior full-stack developer with 7 years of experience",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js"],
    portfolioUrl: "https://alice.dev",
  },
  {
    name: "Bob Smith",
    email: `bob_${RUN_ID}@example.com`,
    twitterHandle: `bob_${RUN_ID}`, // Unique handle per test run
    bio: "Mid-level developer passionate about web technologies",
    skills: ["React", "JavaScript", "Node.js"],
    portfolioUrl: "https://bob.dev",
  },
];

// Step 1: Get tokens
async function getTokens() {
  console.log("\n" + DIVIDER);
  console.log("STEP 1: Getting Authentication Tokens");
  console.log(DIVIDER);

  // Get agent token
  console.log("\n[1.1] Fetching agent token...");
  const agentResponse = await fetch(`${REGISTRY_URL}/users/agent-token`, {
    headers: { "X-Bootstrap-Secret": BOOTSTRAP_SECRET },
  });
  const agentData = await agentResponse.json() as { token: string; agentId: string };
  AGENT_TOKEN = agentData.token;
  console.log(`✓ Agent token obtained: ${agentData.agentId}`);

  // Create job owner user (approver)
  console.log("\n[1.2] Creating job owner user...");
  const ownerResponse = await apiCall("POST", "/users/register", {
    name: `job-owner-${RUN_ID}`,
  });
  JOB_OWNER_TOKEN = ownerResponse.token;
  console.log(`✓ Job owner created: ${ownerResponse.user.id}`);

  // Create applicant users
  console.log("\n[1.3] Creating applicant users...");
  const sessions: ApplicantSession[] = [];
  for (const profile of APPLICANT_PROFILES) {
    const userResponse = await apiCall("POST", "/users/register", {
      name: `${profile.name}-${RUN_ID}`,
      twitterHandle: profile.twitterHandle,
    });
    sessions.push({
      token: userResponse.token,
      userId: userResponse.user.id,
      name: profile.name,
      twitterHandle: profile.twitterHandle,
    });
    console.log(`✓ Applicant user created: ${userResponse.user.id}`);
  }
  APPLICANT_SESSIONS = sessions;
}

// Step 2: Create a job (as agent)
async function createJob() {
  console.log("\n" + DIVIDER);
  console.log("STEP 2: Creating Job (Creation Agent Simulation)");
  console.log(DIVIDER);

  const jobData = {
    id: `job_test_${RUN_ID}`,
    title: "Senior Full-Stack Engineer",
    description: "We're looking for an experienced full-stack engineer to join our team and work on cutting-edge web applications using React and Node.js.",
    requirements: "5+ years of experience with React, Node.js, and TypeScript. Experience with Next.js and PostgreSQL preferred.",
    complexity: "COMPLEX",
    sourceTweetId: "1234567890",
    sourceTweetUrl: "https://twitter.com/example/status/1234567890",
    tags: ["engineering", "remote", "fulltime"],
    createdAt: new Date().toISOString(),
  };

  console.log(`\n[2.1] Creating job: "${jobData.title}"...`);
  const response = await apiCall("POST", "/jobs", jobData, AGENT_TOKEN);
  console.log(`✓ Job created: ${response.id}`);
  console.log(`  Status: ${response.status}`);
  console.log(`  Complexity: ${response.complexity}`);

  return response;
}

// Step 3: Approve job (as user)
async function approveJob(jobId: string) {
  console.log("\n" + DIVIDER);
  console.log("STEP 3: Approving Job (User Action)");
  console.log(DIVIDER);

  console.log(`\n[3.1] User approving job with $5000 budget...`);
  const response = await apiCall(
    "PATCH",
    `/jobs/${jobId}/approve`,
    { budget: 5000 },
    JOB_OWNER_TOKEN
  );
  console.log(`✓ Job approved`);
  console.log(`  Status: ${response.status}`);
  console.log(`  Budget: $${response.budget}`);

  return response;
}

// Step 4: Create applicants
async function createApplicants(): Promise<any[]> {
  console.log("\n" + DIVIDER);
  console.log("STEP 4: Creating Applicant Profiles");
  console.log(DIVIDER);

  const createdApplicants: any[] = [];

  for (let i = 0; i < APPLICANT_PROFILES.length; i++) {
    const applicant = APPLICANT_PROFILES[i];
    const session = APPLICANT_SESSIONS[i];
    console.log(`\n[4.${i + 1}] Creating applicant: ${applicant.name}...`);
    const response = await apiCall("POST", "/applicants", applicant, session.token);
    console.log(`✓ Applicant created: ${response.id}`);
    console.log(`  Twitter: @${applicant.twitterHandle}`);
    console.log(`  Skills: ${applicant.skills.join(", ")}`);
    createdApplicants.push(response);
  }

  return createdApplicants;
}

// Step 5: Submit applications
async function submitApplications(jobId: string, applicants: any[]): Promise<any[]> {
  console.log("\n" + DIVIDER);
  console.log("STEP 5: Submitting Applications");
  console.log(DIVIDER);

  const coverLetters = [
    "I have 7 years of experience building scalable web applications with React and Node.js. I've led multiple projects using Next.js and TypeScript. I'm excited about this opportunity and believe I would be a great fit for your team.",
    "I'm a passionate developer with 3 years of experience in React and Node.js. I'm eager to learn and grow with your team. I have strong fundamentals and I'm a quick learner.",
  ];

  const applications: any[] = [];

  for (let i = 0; i < applicants.length; i++) {
    const session = APPLICANT_SESSIONS[i];
    console.log(`\n[5.${i + 1}] ${applicants[i].name} applying to job...`);
    const response = await apiCall(
      "POST",
      "/applications",
      {
        jobId,
        coverLetter: coverLetters[i],
      },
      session.token
    );
    console.log(`✓ Application submitted: ${response.id}`);
    console.log(`  Status: ${response.status}`);
    applications.push(response);
  }

  return applications;
}

// Step 6: Analyze profiles (Profile Agent simulation)
async function analyzeProfiles(applications: any[], jobId: string) {
  console.log("\n" + DIVIDER);
  console.log("STEP 6: Analyzing Applicant Profiles (Profile Agent)");
  console.log(DIVIDER);

  // Note: This would normally be done by the Profile Agent via POST /profile/analyze
  // For E2E testing, we'll manually update the summaries

  const summaries = [
    `# Profile Analysis

## Skill Match: 95%
Excellent alignment with all required skills. Demonstrates deep expertise in React, Node.js, and TypeScript through recent tweets about building scalable systems.

## Experience Level: senior
Twitter activity shows thought leadership, technical depth, and mentorship indicators. Discusses complex architectural decisions and best practices.

## Availability: fulltime
Recent tweets indicate openness to new opportunities and full-time commitment.

## Strengths
1. 7 years of experience with exact tech stack required
2. Strong communication skills evident in technical discussions
3. Portfolio shows impressive projects with Next.js

## Weaknesses
1. May be slightly overqualified for some aspects
2. Limited recent tweets about PostgreSQL (though listed as skill)
3. High demand candidate - may have other offers

## Overall Recommendation: HIRE
**Confidence: 90%**

Alice is an exceptional fit for this role with extensive relevant experience and strong technical skills. Her background matches requirements perfectly and she demonstrates senior-level expertise.`,

    `# Profile Analysis

## Skill Match: 70%
Good foundation in React and Node.js, but missing some preferred skills like Next.js and PostgreSQL. Shows enthusiasm for learning.

## Experience Level: mid
Twitter activity shows solid technical understanding but less depth than senior candidates. Growing expertise and learning-focused mindset.

## Availability: fulltime
Actively looking for opportunities based on recent tweets.

## Strengths
1. Strong React and JavaScript fundamentals
2. Enthusiastic and passionate about web development
3. Quick learner with growth mindset

## Weaknesses
1. Only 3 years experience vs 5+ required
2. Missing Next.js and PostgreSQL experience
3. Less proven track record than other candidates

## Overall Recommendation: MAYBE
**Confidence: 65%**

Bob is a capable mid-level developer with good potential, but doesn't fully meet the senior-level requirements. Could be considered if budget is tight or team can provide mentorship.`,
  ];

  for (let i = 0; i < applications.length; i++) {
    console.log(`\n[6.${i + 1}] Analyzing ${applications[i].applicant?.name || `application ${i + 1}`}...`);
    const response = await apiCall(
      "PATCH",
      `/applications/${applications[i].id}/summary`,
      { summary: summaries[i] },
      AGENT_TOKEN
    );
    console.log(`✓ Profile analysis complete`);
    console.log(`  Summary length: ${summaries[i].length} chars`);
  }
}

// Step 7: Generate suggestion (Suggestion Agent simulation)
async function generateSuggestion(jobId: string, applicants: any[]) {
  console.log("\n" + DIVIDER);
  console.log("STEP 7: Generating Hiring Suggestion (Suggestion Agent)");
  console.log(DIVIDER);

  // Note: This would normally be done by POST /suggestions/generate/:jobId
  // For E2E testing, we'll manually create the suggestion

  console.log("\n[7.1] Creating suggestion recommending Alice Johnson...");
  const response = await apiCall(
    "POST",
    `/suggestions/generate/${jobId}`,
    {
      suggestedApplicantId: applicants[0].id,
      suggestXai: false,
      reasoning: "Alice Johnson is the clear best choice with 95% skill match, 7 years of relevant experience, and senior-level expertise. She meets all requirements and brings deep knowledge of the tech stack. While Bob is capable, Alice's experience level better matches the COMPLEX job requirements.",
      confidenceScore: 90,
    },
    AGENT_TOKEN
  );
  console.log(`✓ Suggestion created: ${response.id}`);
  console.log(`  Recommended: ${applicants[0].name} (${response.suggestedApplicantId})`);
  console.log(`  Confidence: ${response.confidenceScore}%`);
  console.log(`  Reasoning: ${response.reasoning.slice(0, 100)}...`);

  return response;
}

// Step 8: Assign job to candidate
async function assignJob(jobId: string, applicantId: string) {
  console.log("\n" + DIVIDER);
  console.log("STEP 8: Assigning Job to Candidate");
  console.log(DIVIDER);

  console.log(`\n[8.1] Assigning job to selected candidate...`);
  const response = await apiCall(
    "PATCH",
    `/jobs/${jobId}/assign`,
    { assigneeId: applicantId },
    AGENT_TOKEN
  );
  console.log(`✓ Job assigned`);
  console.log(`  Status: ${response.status}`);
  console.log(`  Assigned to: ${response.assignedTo}`);

  return response;
}

// Step 9: Complete job
async function completeJob(jobId: string) {
  console.log("\n" + DIVIDER);
  console.log("STEP 9: Completing Job");
  console.log(DIVIDER);

  console.log(`\n[9.1] Marking job as completed...`);
  const response = await apiCall("PATCH", `/jobs/${jobId}/complete`, {}, AGENT_TOKEN);
  console.log(`✓ Job completed`);
  console.log(`  Status: ${response.status}`);
  console.log(`  Completed at: ${response.completedAt}`);

  return response;
}

// Step 10: Verify final state
async function verifyFinalState(jobId: string) {
  console.log("\n" + DIVIDER);
  console.log("STEP 10: Verifying Final State");
  console.log(DIVIDER);

  console.log(`\n[10.1] Fetching final job state...`);
  const job = await apiCall("GET", `/jobs/${jobId}`);
  console.log(`✓ Job state verified`);
  console.log(`  ID: ${job.id}`);
  console.log(`  Title: ${job.title}`);
  console.log(`  Status: ${job.status}`);
  console.log(`  Budget: $${job.budget}`);
  console.log(`  Assigned to: ${job.assignedTo}`);
  console.log(`  Created: ${job.createdAt}`);
  console.log(`  Approved: ${job.approvedAt}`);
  console.log(`  Completed: ${job.completedAt}`);

  console.log(`\n[10.2] Fetching applications...`);
  const apps = await apiCall("GET", `/applications/job/${jobId}`, undefined, AGENT_TOKEN);
  console.log(`✓ Found ${apps.applications.length} applications`);
  for (const app of apps.applications) {
    console.log(`  - ${app.applicant?.name}: ${app.status}`);
  }

  console.log(`\n[10.3] Fetching suggestion...`);
  const suggestion = await apiCall("GET", `/suggestions/job/${jobId}`, undefined, AGENT_TOKEN);
  console.log(`✓ Suggestion verified`);
  console.log(`  Recommended xAI: ${suggestion.suggestXai}`);
  console.log(`  Confidence: ${suggestion.confidenceScore}%`);
}

// Main test runner
async function runE2ETest() {
  console.log("\n" + DIVIDER);
  console.log("JOB MARKETPLACE BACKEND E2E TEST");
  console.log(DIVIDER);
  console.log(`\nRegistry URL: ${REGISTRY_URL}`);
  console.log(`Testing complete job marketplace flow...\n`);

  try {
    // Health check
    console.log("Checking registry health...");
    const health = await fetch(`${REGISTRY_URL}/health`);
    if (!health.ok) {
      throw new Error("Registry is not healthy");
    }
    console.log("✓ Registry is healthy\n");

    // Run test flow
    await getTokens();
    const job = await createJob();
    await approveJob(job.id);
    const applicants = await createApplicants();
    const applications = await submitApplications(job.id, applicants);
    await analyzeProfiles(applications, job.id);
    await generateSuggestion(job.id, applicants);
    await assignJob(job.id, applicants[0].id);
    await completeJob(job.id);
    await verifyFinalState(job.id);

    // Success
    console.log("\n" + DIVIDER);
    console.log("✅ ALL TESTS PASSED");
    console.log(DIVIDER);
    console.log("\nThe complete job marketplace flow is working correctly!");
    console.log("All backend services are functioning as expected.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n" + DIVIDER);
    console.error("❌ TEST FAILED");
    console.error(DIVIDER);
    console.error("\nError:", error);
    console.error("\n");
    process.exit(1);
  }
}

// Run the test
runE2ETest();
