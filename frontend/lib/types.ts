/**
 * Frontend Types for xBounty Job Marketplace
 */

// =============================================================================
// USER & AUTH
// =============================================================================

export type UserRole = 'user' | 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  twitterHandle?: string;
  avatar?: string;
  createdAt: string;
  lastActiveAt?: string;
}

// =============================================================================
// JOB / BOUNTY
// =============================================================================

export type JobStatus = 'PENDING_APPROVAL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BountyStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
export type JobComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX';

export interface JobCreator {
  id: string;
  name: string;
  twitterHandle?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  budget: number | null;
  status: JobStatus;
  complexity: JobComplexity | null;
  sourceTweetId: string | null;
  sourceTweetUrl: string | null;
  createdBy: string | null;
  createdAt: string;
  approvedAt: string | null;
  assignedTo: string | null;
  completedAt: string | null;
  // Enriched creator info from registry
  creator?: JobCreator;
}

// Legacy Bounty type for backward compatibility
export type BountyCategory = 
  | 'development'
  | 'design'
  | 'writing'
  | 'marketing'
  | 'research'
  | 'other';

export type Currency = 'USD' | 'ETH' | 'SOL' | 'USDC';

export interface Bounty {
  id: string;
  title: string;
  description: string;
  category: BountyCategory;
  reward: number;
  currency: Currency;
  status: BountyStatus;
  poster: User;
  postedAt: Date;
  tags: string[];
  applicantCount: number;
  viewCount: number;
  bookmarkCount: number;
  applicationDeadline?: Date;
  maxApplicants?: number;
  // New fields from Job
  requirements?: string;
  complexity?: JobComplexity;
  sourceTweetUrl?: string;
}

export type SortOption = 'recent' | 'popular' | 'highest_reward';

// =============================================================================
// APPLICANT
// =============================================================================

export interface Applicant {
  id: string;
  name: string;
  email: string | null;
  twitterHandle: string | null;
  bio: string | null;
  skills: string[];
  portfolioUrl: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

// =============================================================================
// APPLICATION
// =============================================================================

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  jobId: string;
  bountyId: string; // alias for backward compat
  applicantId: string;
  applicant: User | Applicant;
  coverLetter: string | null;
  profileSummary: string | null;
  appliedAt: string | Date;
  status: ApplicationStatus | 'pending' | 'accepted' | 'rejected';
  // Legacy fields
  message: string;
  bidAmount: number;
  bidCurrency: Currency;
}

// =============================================================================
// SUGGESTION
// =============================================================================

export interface Suggestion {
  id: string;
  jobId: string;
  suggestedApplicantId: string | null;
  suggestXai: boolean;
  reasoning: string | null;
  confidenceScore: number | null;
  createdAt: string;
  applicant?: Applicant;
}

// =============================================================================
// XAI WORK
// =============================================================================

export type XaiWorkStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface XaiWork {
  id: string;
  jobId: string;
  status: XaiWorkStatus;
  /** The work output produced by xAI */
  output: string | null;
  /** Any artifacts/deliverables (URLs or content) */
  artifacts: string[];
  /** Execution notes/logs from xAI */
  executionNotes: string | null;
  /** Error message if failed */
  errorMessage: string | null;
  /** Processing started at */
  startedAt: string | null;
  /** Processing completed at */
  completedAt: string | null;
  createdAt: string;
}

