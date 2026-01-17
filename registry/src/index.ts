// =============================================================================
// SIG Arena - Job Marketplace Registry
// =============================================================================
//
// Job marketplace backend with SQLite persistence.
// Handles jobs, applicants, applications, and suggestions.
//
// =============================================================================

// Core classes
export { JobRegistry, JobRegistry as MarketRegistry } from "./registry.js";
export { MarketStorage, createTestStorage } from "./storage/index.js";

// API
export { api, registry } from "./api/index.js";

// Types
export type {
  // User & Auth
  UserRole,
  User,
  
  // Jobs
  JobStatus,
  JobComplexity,
  Job,
  CreateJobInput,
  JobFilters,
  
  // Applicants
  Applicant,
  CreateApplicantInput,
  ApplicantFilters,
  
  // Applications
  ApplicationStatus,
  Application,
  CreateApplicationInput,
  ApplicationFilters,
  
  // Suggestions
  Suggestion,
  CreateSuggestionInput,
  SuggestionFilters,
} from "./types.js";
