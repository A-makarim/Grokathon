/**
 * xAI Work Processor
 * 
 * Shared module for processing work using xAI (Grok).
 */

import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { registry } from "./index.js";
import type { Job } from "../types.js";

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

const XAI_WORK_SYSTEM_PROMPT = `You are an AI agent powered by xAI (Grok) that completes bounty tasks.

When given a job/bounty, you will:
1. Analyze the task requirements carefully
2. Break down the work into clear steps
3. Execute the work to the best of your ability
4. Produce high-quality deliverables

Your output should be:
- Clear and well-structured
- Directly addressing the task requirements
- Professional and thorough
- Include any code, text, or analysis as requested

Format your response as a detailed work output that the job poster can review and use. Use markdown formatting for better readability.`;

// =============================================================================
// PROCESSOR
// =============================================================================

/**
 * Build the work prompt from job data
 */
function buildWorkPrompt(job: Job): string {
  const sections: string[] = [];
  
  sections.push(`# Task: ${job.title}`);
  sections.push("");
  sections.push(`## Description`);
  sections.push(job.description);

  if (job.requirements) {
    sections.push("");
    sections.push(`## Requirements`);
    sections.push(job.requirements);
  }

  if (job.complexity) {
    sections.push("");
    sections.push(`## Complexity Level: ${job.complexity}`);
  }

  if (job.budget) {
    sections.push("");
    sections.push(`## Budget: $${job.budget}`);
  }

  sections.push("");
  sections.push(`---`);
  sections.push("");
  sections.push(`Please complete this task to the best of your ability. Provide detailed, high-quality output that directly addresses all requirements. Structure your response clearly with sections and formatting as appropriate for the task type.`);

  return sections.join("\n");
}

/**
 * Process xAI work asynchronously using Grok
 */
export async function processXaiWork(workId: string, job: Job): Promise<void> {
  console.log(`[xAI Work] Starting work ${workId} for job ${job.id}`);

  // Update status to in progress
  registry.updateXaiWorkStatus(workId, "IN_PROGRESS");

  try {
    // Build the prompt
    const prompt = buildWorkPrompt(job);

    // Call xAI (Grok) to generate the work output
    const result = await generateText({
      model: xai(process.env.XAI_MODEL || "grok-3-mini"),
      system: XAI_WORK_SYSTEM_PROMPT,
      prompt,
      maxTokens: 4000,
      providerOptions: {
        xai: {
          // Enable Live Search for research-heavy tasks
          searchParameters: {
            mode: "auto",
            returnCitations: true,
            maxSearchResults: 10,
            sources: [
              { type: "web", safeSearch: true },
              { type: "news", safeSearch: true },
            ],
          },
        },
      },
    });

    const output = result.text;
    
    // Extract any sources/citations as artifacts
    const artifacts: string[] = [];
    if (result.sources && result.sources.length > 0) {
      for (const source of result.sources) {
        if (source.url) {
          artifacts.push(source.url);
        }
      }
    }

    // Build execution notes
    const executionNotes = [
      `Model: ${process.env.XAI_MODEL || "grok-3-mini"}`,
      `Generated at: ${new Date().toISOString()}`,
      result.sources?.length ? `Sources used: ${result.sources.length}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Save the output
    registry.saveXaiWorkOutput(workId, output, artifacts, executionNotes);

    console.log(`[xAI Work] Completed work ${workId}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[xAI Work] Failed work ${workId}:`, errorMessage);
    registry.saveXaiWorkError(workId, errorMessage);
  }
}
