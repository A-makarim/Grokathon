/**
 * Job Types
 *
 * Core job schemas for job marketplace.
 */

import { z } from "zod";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Job complexity levels (determines xAI eligibility)
 */
export const COMPLEXITY_LEVELS = ["SIMPLE", "MODERATE", "COMPLEX"] as const;

export type JobComplexity = (typeof COMPLEXITY_LEVELS)[number];

// ============================================================================
// SCHEMAS
// ============================================================================

/**
 * Schema for LLM-generated job (without auto-generated fields)
 *
 * This is what the AI model outputs. The agent adds id/createdAt.
 */
export const GeneratedJobSchema = z.object({
  /** Job title (e.g., "Senior Software Engineer") */
  title: z.string(),

  /** Detailed job description */
  description: z.string(),

  /** Job requirements/qualifications (optional) */
  requirements: z.string().optional(),

  /** Complexity classification */
  complexity: z.enum(COMPLEXITY_LEVELS),

  /** Source tweet ID */
  sourceTweetId: z.string(),

  /** Source tweet URL */
  sourceTweetUrl: z.string().url(),

  /** Tags for categorization */
  tags: z.array(z.string()).optional(),
});

export type GeneratedJob = z.infer<typeof GeneratedJobSchema>;

/**
 * Full job with auto-generated fields
 *
 * This is the final job object stored in the registry.
 */
export const JobSchema = GeneratedJobSchema.extend({
  /** Unique identifier (auto-generated) */
  id: z.string(),

  /** When this job was created (auto-generated) */
  createdAt: z.string().datetime(),
});

export type Job = z.infer<typeof JobSchema>;

/**
 * Batch of jobs from a single detection run
 */
export const JobBatchSchema = z.object({
  generatedAt: z.string().datetime(),
  jobs: z.array(JobSchema),
  searchContext: z.string(),
});

export type JobBatch = z.infer<typeof JobBatchSchema>;
