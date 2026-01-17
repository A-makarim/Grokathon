/**
 * Suggestion Agent Types
 */

/**
 * Suggestion request
 */
export interface GenerateSuggestionRequest {
  jobId: string;
}

/**
 * Suggestion result from AI
 */
export interface SuggestionResult {
  recommendXAI: boolean;
  applicantId: string | null; // null if xAI recommended
  reasoning: string;
  confidence: number; // 0-100
  runnerUp: string | null;
}

/**
 * Suggestion Agent configuration
 */
export interface SuggestionConfig {
  registryUrl: string;
  xaiApiKey: string;
  model: string;
}
