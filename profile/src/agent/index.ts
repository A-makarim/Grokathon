/**
 * Profile Agent - Analyzes applicant Twitter profiles for job fit
 */

import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { getXClient } from "@xbounty/common";
import { CONFIG } from "../config/index.js";
import { getSystemPrompt } from "../prompts/system.js";
import { buildAnalysisPrompt, type AnalysisPromptInput } from "../prompts/analysis.js";

// Registry client functions
async function getApplicant(id: string) {
  const response = await fetch(`${CONFIG.registryUrl}/applicants/${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return response.json();
}

async function getJob(id: string) {
  const response = await fetch(`${CONFIG.registryUrl}/jobs/${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return response.json();
}

async function updateApplicationSummary(applicationId: string, summary: string, agentToken: string) {
  const response = await fetch(`${CONFIG.registryUrl}/applications/${applicationId}/summary`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ summary }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Twitter data fetching using X client directly
async function fetchTwitterUser(username: string) {
  const client = getXClient();
  const result = await client.users.getByUsername(username, {
    userFields: [
      "description",
      "public_metrics",
      "verified",
      "location",
      "url",
      "created_at",
    ],
  });
  return result;
}

async function fetchUserTweets(userId: string, maxResults: number = 50) {
  const client = getXClient();
  const result = await client.users.getPosts(userId, {
    maxResults,
    tweetFields: [
      "created_at",
      "public_metrics",
      "text",
    ],
  });
  return result;
}

export class ProfileAgent {
  /**
   * Analyze an applicant's profile for a specific job
   */
  async analyzeApplicant(applicantId: string, jobId: string): Promise<string> {
    console.log(`[Profile Agent] Analyzing applicant ${applicantId} for job ${jobId}...`);

    // 1. Fetch applicant and job from registry
    console.log("[Profile Agent] Fetching applicant and job data...");
    const [applicantData, jobData] = await Promise.all([
      getApplicant(applicantId),
      getJob(jobId),
    ]);

    const applicant = applicantData.applicant;
    const job = jobData;

    if (!applicant) {
      throw new Error(`Applicant ${applicantId} not found`);
    }
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // 2. Fetch Twitter profile and recent tweets
    if (!applicant.twitterHandle) {
      throw new Error(`Applicant ${applicantId} has no Twitter handle`);
    }

    console.log(`[Profile Agent] Fetching Twitter data for @${applicant.twitterHandle}...`);

    const userResult = await fetchTwitterUser(applicant.twitterHandle);
    const user = userResult.data;
    
    if (!user) {
      throw new Error(`Twitter user @${applicant.twitterHandle} not found`);
    }

    const tweetsResult = await fetchUserTweets(user.id, 50);
    const tweets = tweetsResult.data || [];

    console.log(`[Profile Agent] Fetched ${tweets.length} recent tweets`);

    // 3. Build prompt
    const publicMetrics = (user as any).public_metrics || (user as any).publicMetrics || {};
    
    const input: AnalysisPromptInput = {
      applicant: {
        name: applicant.name,
        email: applicant.email,
        twitterHandle: applicant.twitterHandle,
        bio: applicant.bio,
        skills: applicant.skills || [],
        portfolioUrl: applicant.portfolioUrl,
      },
      job: {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        complexity: job.complexity,
        budget: job.budget,
      },
      twitterProfile: {
        bio: user.description || "",
        followersCount: publicMetrics.followers_count || 0,
        followingCount: publicMetrics.following_count || 0,
        tweetCount: publicMetrics.tweet_count || 0,
        verified: user.verified || false,
        location: user.location || null,
        website: user.url || null,
      },
      recentTweets: tweets.map((tweet: any) => ({
        text: tweet.text || "",
        createdAt: tweet.created_at || "",
        likeCount: tweet.public_metrics?.like_count || 0,
        retweetCount: tweet.public_metrics?.retweet_count || 0,
        replyCount: tweet.public_metrics?.reply_count || 0,
      })),
    };

    const prompt = buildAnalysisPrompt(input);
    const systemPrompt = getSystemPrompt();

    // 4. Generate analysis with xAI
    console.log("[Profile Agent] Generating analysis with xAI...");

    const result = await generateText({
      model: xai(CONFIG.model),
      system: systemPrompt,
      prompt,
      maxTokens: 2000,
    });

    const summary = result.text;
    console.log(`[Profile Agent] Analysis complete (${summary.length} chars)`);

    return summary;
  }

  /**
   * Analyze and update application summary
   */
  async analyzeAndUpdateApplication(
    applicationId: string,
    applicantId: string,
    jobId: string,
    agentToken: string
  ): Promise<{ success: boolean; summary: string; error?: string }> {
    try {
      const summary = await this.analyzeApplicant(applicantId, jobId);

      console.log(`[Profile Agent] Updating application ${applicationId}...`);
      await updateApplicationSummary(applicationId, summary, agentToken);

      console.log("[Profile Agent] ✓ Analysis complete and saved");
      return { success: true, summary };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`[Profile Agent] ✗ Analysis failed: ${error}`);
      return { success: false, summary: "", error };
    }
  }
}
