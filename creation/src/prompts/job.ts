/**
 * Job Detection Prompt
 *
 * The main instruction prompt for the job creation agent.
 */

import type { GenerationConfig } from "../types/index.js";

/**
 * Target accounts to search for job postings
 * These are the accounts we monitor for hiring posts
 */
export const TARGET_ACCOUNTS = [
  "keerthanenr", // Test account
  // Add more accounts here as needed:
  // "vercel",
  // "stripe", 
  // "notion",
  // "ycombinator",
];

/**
 * Generate the job detection prompt
 */
export function getJobPrompt(config: GenerationConfig): string {
  const maxJobs = config.marketsPerRun || 5;
  const accountsList = TARGET_ACCOUNTS.map(a => `@${a}`).join(", ");

  return `# Job Marketplace - Job Detection from Target Accounts

You are detecting job postings from specific X/Twitter accounts for a job marketplace platform. Your job is to search these TARGET ACCOUNTS for any job opportunities, hiring posts, or work requests.

## TARGET ACCOUNTS TO SEARCH
${accountsList}

## Your Task

1. **CHECK EXISTING JOBS FIRST** - Use \`searchExistingJobs\` to see what's already in the system
2. **SEARCH EACH TARGET ACCOUNT** - Get their recent tweets and look for job/hiring posts
3. **EXTRACT JOB DETAILS** from any hiring-related tweets
4. **CREATE** up to ${maxJobs} job postings from what you find
5. **OUTPUT** valid JSON matching the schema below

## 🔬 RESEARCH PROTOCOL (FOLLOW THIS)

### Phase 1: Check Existing Jobs (REQUIRED FIRST)
**BEFORE doing any research, check what jobs already exist:**
- \`searchExistingJobs\` - Search registry for existing jobs
  - Search with empty query to see ALL jobs
  - Check status: ["PENDING_APPROVAL", "OPEN"] to see active jobs

**DO NOT create duplicate jobs.** If you find the same job posting, skip it.

### Phase 2: Search Each Target Account
For EACH account in the target list:

1. **Get User Info**
   - \`getUserByUsername\` - Get the account profile
   - Note: follower count, bio, verification status

2. **Get Recent Tweets**
   - \`getUserTweets\` - Get their recent tweets (last 20-50)
   - Look for keywords indicating job posts:
     - "hiring", "we're hiring", "looking for"
     - "job", "position", "role", "opportunity"
     - "freelance", "contract", "remote"
     - "help wanted", "need someone", "looking to hire"
     - "seeking", "wanted", "join us", "join our team"

3. **For Each Potential Job Tweet**
   - Extract job details (title, description, requirements)
   - Get the tweet URL for source reference
   - Classify complexity

### Phase 3: Duplicate Check
- \`searchExistingJobs\` - Final check for duplicates before creating

## What Counts as a Job Post?

Look for tweets that indicate:
- **Direct Hiring**: "We're hiring a developer", "Looking for a designer"
- **Freelance Work**: "Need help with X", "Looking for freelance Y"
- **Contract Work**: "Contract opportunity", "Short-term project"
- **Collaboration**: "Looking for a co-founder", "Need a technical partner"
- **Open Calls**: "DM me if you can help with X"

Even informal requests count! If someone is looking for help with work, that's a potential job.

## Complexity Classification

**SIMPLE** (xAI can potentially do this):
- Data entry, scraping, or processing
- Automated content moderation
- Simple social media posting
- Basic API integrations
- Report generation

**MODERATE** (Human preferred):
- Content writing/copywriting
- Basic design work
- Community management
- Customer support
- Entry-level development

**COMPLEX** (Human required):
- Senior technical roles
- Strategic positions
- Creative leadership
- Consulting or advisory
- Management roles

**When in doubt, choose MODERATE.**

## Output Schema

Output MUST be a JSON object with a "jobs" array. Each job object must have:

\`\`\`json
{
  "jobs": [
    {
      "title": "Senior Software Engineer",
      "description": "We're looking for an experienced full-stack engineer to join our team...",
      "requirements": "5+ years experience with React, Node.js, and distributed systems. Remote-friendly.",
      "complexity": "COMPLEX",
      "sourceTweetId": "1234567890",
      "sourceTweetUrl": "https://twitter.com/company/status/1234567890",
      "tags": ["engineering", "remote", "fulltime"]
    }
  ]
}
\`\`\`

**Required fields:**
- \`title\` (string) - Specific job title (infer from context if not explicit)
- \`description\` (string) - What the role/work entails
- \`requirements\` (string, optional) - Skills/experience needed
- \`complexity\` (string) - "SIMPLE" | "MODERATE" | "COMPLEX"
- \`sourceTweetId\` (string) - Tweet ID
- \`sourceTweetUrl\` (string) - Full tweet URL
- \`tags\` (string[], optional) - Relevant tags

## Example Output

\`\`\`json
{
  "jobs": [
    {
      "title": "Full-Stack Developer (Contract)",
      "description": "Looking for a developer to help build a new feature for our web app. React + Node.js. 2-3 week project.",
      "requirements": "Experience with React and Node.js. Available to start immediately.",
      "complexity": "MODERATE",
      "sourceTweetId": "1880123456789",
      "sourceTweetUrl": "https://twitter.com/keerthanenr/status/1880123456789",
      "tags": ["development", "contract", "react", "nodejs"]
    },
    {
      "title": "AI/ML Research Assistant",
      "description": "Need someone to help with AI research and implementation. Looking for someone who can work on ML models.",
      "requirements": "Python, PyTorch or TensorFlow experience. Research background preferred.",
      "complexity": "COMPLEX",
      "sourceTweetId": "1880987654321",
      "sourceTweetUrl": "https://twitter.com/keerthanenr/status/1880987654321",
      "tags": ["ai", "ml", "research", "python"]
    }
  ]
}
\`\`\`

If you find NO job-related posts from any target account, output: \`{"jobs": []}\`

## IMPORTANT REMINDERS

1. **SEARCH ALL TARGET ACCOUNTS** - Don't skip any
2. **Be Inclusive** - Even informal "need help" posts count as potential jobs
3. **NO DUPLICATES** - Always check searchExistingJobs first
4. **USE REAL TWEET IDs** - Get the actual tweet ID and URL
5. **INFER DETAILS** - If job title isn't explicit, create a reasonable one from context

## Execution Steps

1. Call \`searchExistingJobs\` to see existing jobs
2. For each target account (${accountsList}):
   a. Call \`getUserByUsername\` to verify account exists
   b. Call \`getUserTweets\` to get recent tweets
   c. Scan for any hiring/job/work related content
3. Extract job details from relevant tweets
4. Output JSON with all found jobs

Now, begin searching the target accounts for job postings!`;
}
