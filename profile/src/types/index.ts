/**
 * Profile Agent Types
 */

/**
 * Profile analysis request
 */
export interface AnalyzeProfileRequest {
  applicantId: string;
  jobId: string;
}

/**
 * Profile analysis result
 */
export interface ProfileAnalysis {
  applicantId: string;
  jobId: string;
  summary: string;
  skillMatch: number; // 0-100
  experienceLevel: "junior" | "mid" | "senior" | "expert";
  availability: "fulltime" | "parttime" | "contract" | "unknown";
  strengths: string[];
  weaknesses: string[];
  recommendation: "hire" | "pass" | "maybe";
  confidence: number; // 0-100
}

/**
 * Profile Agent configuration
 */
export interface ProfileConfig {
  registryUrl: string;
  xaiApiKey: string;
  xBearerToken: string;
  model: string;
}
