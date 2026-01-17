/**
 * Profile Analysis Prompt Builder
 */

export interface AnalysisPromptInput {
  applicant: {
    name: string;
    email: string | null;
    twitterHandle: string | null;
    bio: string | null;
    skills: string[];
    portfolioUrl: string | null;
  };
  job: {
    title: string;
    description: string;
    requirements: string | null;
    complexity: string | null;
    budget: number | null;
  };
  twitterProfile: {
    bio: string;
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    verified: boolean;
    location: string | null;
    website: string | null;
  };
  recentTweets: Array<{
    text: string;
    createdAt: string;
    likeCount: number;
    retweetCount: number;
    replyCount: number;
  }>;
}

export function buildAnalysisPrompt(input: AnalysisPromptInput): string {
  const { applicant, job, twitterProfile, recentTweets } = input;

  return `# Analyze This Applicant for the Job

## JOB POSTING

**Title:** ${job.title}

**Description:**
${job.description}

${job.requirements ? `**Requirements:**\n${job.requirements}\n` : ""}
**Complexity:** ${job.complexity || "Not specified"}
**Budget:** ${job.budget ? `$${job.budget}` : "Not specified"}

---

## APPLICANT PROFILE

**Name:** ${applicant.name}
**Email:** ${applicant.email || "Not provided"}
**Twitter:** ${applicant.twitterHandle ? `@${applicant.twitterHandle}` : "Not provided"}
${applicant.portfolioUrl ? `**Portfolio:** ${applicant.portfolioUrl}\n` : ""}
${applicant.bio ? `**Bio:** ${applicant.bio}\n` : ""}
**Skills:** ${applicant.skills.length > 0 ? applicant.skills.join(", ") : "None listed"}

---

## TWITTER PROFILE

**Bio:** ${twitterProfile.bio || "No bio"}
**Followers:** ${twitterProfile.followersCount.toLocaleString()}
**Following:** ${twitterProfile.followingCount.toLocaleString()}
**Tweets:** ${twitterProfile.tweetCount.toLocaleString()}
**Verified:** ${twitterProfile.verified ? "Yes ✓" : "No"}
${twitterProfile.location ? `**Location:** ${twitterProfile.location}\n` : ""}
${twitterProfile.website ? `**Website:** ${twitterProfile.website}\n` : ""}

---

## RECENT TWEETS (Last 50)

${recentTweets.length === 0 ? "No recent tweets found." : ""}
${recentTweets
  .slice(0, 50)
  .map((tweet, i) => {
    return `### Tweet ${i + 1} (${tweet.createdAt})
${tweet.text}

*Engagement: ${tweet.likeCount} likes, ${tweet.retweetCount} retweets, ${tweet.replyCount} replies*
`;
  })
  .join("\n---\n\n")}

---

# Your Analysis

Provide a comprehensive profile analysis following the structured format in your system prompt.`;
}
