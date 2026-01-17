/**
 * Suggestion Agent - Ranks applicants and recommends best candidate or xAI
 */

import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { CONFIG } from "../config/index.js";
import { getSystemPrompt } from "../prompts/system.js";
import { buildSuggestionPrompt, type SuggestionPromptInput } from "../prompts/suggestion.js";
import type { SuggestionResult } from "../types/index.js";

// Registry client functions
async function getJob(id: string) {
  const response = await fetch(`${CONFIG.registryUrl}/jobs/${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return response.json();
}

async function getApplicationsByJob(jobId: string, agentToken: string) {
  const response = await fetch(`${CONFIG.registryUrl}/applications/job/${jobId}`, {
    headers: {
      Authorization: `Bearer ${agentToken}`,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return response.json();
}

async function createSuggestion(
  jobId: string,
  suggestion: SuggestionResult,
  agentToken: string
) {
  const response = await fetch(`${CONFIG.registryUrl}/suggestions/generate/${jobId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      suggestedApplicantId: suggestion.applicantId,
      suggestXai: suggestion.recommendXAI,
      reasoning: suggestion.reasoning,
      confidenceScore: suggestion.confidence,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Create xAI applicant if it doesn't exist
async function ensureXAIApplicant(agentToken: string) {
  try {
    // Try to get existing xAI applicant
    const response = await fetch(`${CONFIG.registryUrl}/applicants/xai-agent`);
    if (response.ok) {
      const data = await response.json();
      return data.applicant?.id || "xai-agent";
    }
  } catch (err) {
    // Doesn't exist, create it
  }

  // Create xAI applicant
  const createResponse = await fetch(`${CONFIG.registryUrl}/applicants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      id: "xai-agent",
      name: "xAI Agent",
      twitterHandle: "xai",
      bio: "AI agent powered by Grok that can complete simple automation tasks",
      skills: ["automation", "api-integration", "data-processing", "scraping"],
      portfolioUrl: "https://x.ai",
      avatarUrl: "https://x.ai/favicon.ico",
    }),
  });

  if (!createResponse.ok) {
    console.warn("[Suggestion Agent] Failed to create xAI applicant");
  }

  return "xai-agent";
}

// Create xAI application if recommended
async function createXAIApplication(jobId: string, agentToken: string) {
  const xaiApplicantId = await ensureXAIApplicant(agentToken);

  const response = await fetch(`${CONFIG.registryUrl}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      jobId,
      applicantId: xaiApplicantId,
      coverLetter:
        "I am an AI agent that can complete this task autonomously. I specialize in simple automation tasks like data processing, API integration, and repetitive workflows. I offer 24/7 availability, fast execution, and cost-effective solutions.",
      profileSummary:
        "**xAI Agent**: Perfect for SIMPLE complexity tasks. Specialized in automation, data processing, and API integrations. No overhead, instant availability, reliable execution. Best for tasks that can be fully automated without requiring human judgment or creativity.",
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    console.warn(`[Suggestion Agent] Failed to create xAI application: ${data.error}`);
  } else {
    console.log("[Suggestion Agent] Created xAI application");
  }
}

export class SuggestionAgent {
  /**
   * Generate suggestion for a job
   */
  async generateSuggestion(jobId: string, agentToken: string): Promise<SuggestionResult> {
    console.log(`[Suggestion Agent] Generating suggestion for job ${jobId}...`);

    // 1. Fetch job and applications
    console.log("[Suggestion Agent] Fetching job and applications...");
    const [job, applicationsData] = await Promise.all([
      getJob(jobId),
      getApplicationsByJob(jobId, agentToken),
    ]);

    const applications = applicationsData.applications || [];

    if (!job || !job.id) {
      throw new Error(`Job ${jobId} not found`);
    }

    console.log(`[Suggestion Agent] Found ${applications.length} applications`);

    // 2. Build prompt
    const input: SuggestionPromptInput = {
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        complexity: job.complexity,
        budget: job.budget,
      },
      applications: applications.map((app: any) => ({
        id: app.id,
        applicant: {
          id: app.applicant.id,
          name: app.applicant.name,
          twitterHandle: app.applicant.twitterHandle,
          skills: app.applicant.skills || [],
        },
        coverLetter: app.coverLetter,
        profileSummary: app.profileSummary,
      })),
    };

    const prompt = buildSuggestionPrompt(input);
    const systemPrompt = getSystemPrompt();

    // 3. Generate suggestion with xAI
    console.log("[Suggestion Agent] Generating recommendation with xAI...");

    const result = await generateText({
      model: xai(CONFIG.model),
      system: systemPrompt,
      prompt,
      maxTokens: 1000,
    });

    // 4. Parse JSON output
    let parsed: SuggestionResult;
    try {
      parsed = JSON.parse(result.text);
    } catch (err) {
      console.error(`[Suggestion Agent] Failed to parse JSON: ${result.text}`);
      throw new Error("AI returned invalid JSON");
    }

    // Validate output
    if (
      typeof parsed.recommendXAI !== "boolean" ||
      typeof parsed.reasoning !== "string" ||
      typeof parsed.confidence !== "number"
    ) {
      throw new Error("AI output missing required fields");
    }

    console.log(
      `[Suggestion Agent] Recommendation: ${
        parsed.recommendXAI ? "xAI" : `Applicant ${parsed.applicantId}`
      } (confidence: ${parsed.confidence}%)`
    );

    return parsed;
  }

  /**
   * Generate and save suggestion to registry
   */
  async generateAndSaveSuggestion(
    jobId: string,
    agentToken: string
  ): Promise<{ success: boolean; suggestion?: SuggestionResult; error?: string }> {
    try {
      const suggestion = await this.generateSuggestion(jobId, agentToken);

      // If xAI recommended, create xAI application
      if (suggestion.recommendXAI) {
        console.log("[Suggestion Agent] Creating xAI application...");
        await createXAIApplication(jobId, agentToken);
      }

      // Save suggestion to registry
      console.log("[Suggestion Agent] Saving suggestion to registry...");
      await createSuggestion(jobId, suggestion, agentToken);

      console.log("[Suggestion Agent] ✓ Suggestion saved");
      return { success: true, suggestion };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`[Suggestion Agent] ✗ Failed: ${error}`);
      return { success: false, error };
    }
  }
}
