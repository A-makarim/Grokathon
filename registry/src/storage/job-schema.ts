/**
 * Job Marketplace SQLite Schema and Row Types
 */

// =============================================================================
// JOB MARKETPLACE SCHEMA
// =============================================================================

export const JOB_SCHEMA = `
-- Jobs table (replaces markets for job marketplace)
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget REAL,
  status TEXT CHECK(status IN ('PENDING_APPROVAL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING_APPROVAL',
  complexity TEXT CHECK(complexity IN ('SIMPLE', 'MODERATE', 'COMPLEX')),
  source_tweet_id TEXT,
  source_tweet_url TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  approved_at TEXT,
  assigned_to TEXT,
  completed_at TEXT
);

-- Applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  twitter_handle TEXT UNIQUE,
  bio TEXT,
  skills TEXT,
  portfolio_url TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id TEXT NOT NULL REFERENCES applicants(id),
  cover_letter TEXT,
  profile_summary TEXT,
  bid_amount REAL,
  applied_at TEXT NOT NULL,
  status TEXT CHECK(status IN ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED')) DEFAULT 'PENDING'
);

-- Suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  suggested_applicant_id TEXT REFERENCES applicants(id),
  suggest_xai INTEGER DEFAULT 0,
  reasoning TEXT,
  confidence_score REAL CHECK(confidence_score >= 0 AND confidence_score <= 100),
  created_at TEXT NOT NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON jobs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_applicants_twitter ON applicants(twitter_handle);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_job ON suggestions(job_id);
`;

// =============================================================================
// ROW TYPES (internal database representations)
// =============================================================================

export interface JobRow {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  budget: number | null;
  status: string;
  complexity: string | null;
  source_tweet_id: string | null;
  source_tweet_url: string | null;
  created_by: string | null;
  created_at: string;
  approved_at: string | null;
  assigned_to: string | null;
  completed_at: string | null;
}

export interface ApplicantRow {
  id: string;
  name: string;
  email: string | null;
  twitter_handle: string | null;
  bio: string | null;
  skills: string; // JSON stringified array
  portfolio_url: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string | null;
  profile_summary: string | null;
  bid_amount: number | null;
  applied_at: string;
  status: string;
}

export interface SuggestionRow {
  id: string;
  job_id: string;
  suggested_applicant_id: string | null;
  suggest_xai: number; // SQLite stores booleans as 0/1
  reasoning: string | null;
  confidence_score: number | null;
  created_at: string;
}
