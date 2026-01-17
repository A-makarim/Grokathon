/**
 * Suggestion Storage Operations
 */

import type Database from "better-sqlite3";
import type { SuggestionRow } from "./job-schema.js";
import { getApplicant } from "./applicants.js";
import type {
  Suggestion,
  CreateSuggestionInput,
  SuggestionFilters,
} from "../types.js";

// =============================================================================
// CREATE
// =============================================================================

export function createSuggestion(db: Database.Database, input: CreateSuggestionInput): Suggestion {
  const stmt = db.prepare(`
    INSERT INTO suggestions (
      id, job_id, suggested_applicant_id, suggest_xai, reasoning, confidence_score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    input.id,
    input.jobId,
    input.suggestedApplicantId || null,
    input.suggestXai ? 1 : 0,
    input.reasoning,
    input.confidenceScore,
    input.createdAt
  );

  return getSuggestion(db, input.id)!;
}

// =============================================================================
// READ
// =============================================================================

export function getSuggestion(db: Database.Database, id: string): Suggestion | undefined {
  const row = db.prepare("SELECT * FROM suggestions WHERE id = ?").get(id) as SuggestionRow | undefined;
  if (!row) return undefined;

  const suggestion = rowToSuggestion(row);

  // Join with applicant data if human suggested
  if (row.suggested_applicant_id) {
    const applicant = getApplicant(db, row.suggested_applicant_id);
    if (applicant) {
      suggestion.applicant = applicant;
    }
  }

  return suggestion;
}

export function getSuggestionByJob(db: Database.Database, jobId: string): Suggestion | undefined {
  // Get the latest suggestion for this job
  const row = db.prepare(
    "SELECT * FROM suggestions WHERE job_id = ? ORDER BY created_at DESC LIMIT 1"
  ).get(jobId) as SuggestionRow | undefined;

  if (!row) return undefined;

  const suggestion = rowToSuggestion(row);

  // Join with applicant data if human suggested
  if (row.suggested_applicant_id) {
    const applicant = getApplicant(db, row.suggested_applicant_id);
    if (applicant) {
      suggestion.applicant = applicant;
    }
  }

  return suggestion;
}

export function listSuggestions(db: Database.Database, filters?: SuggestionFilters): Suggestion[] {
  let query = "SELECT * FROM suggestions WHERE 1=1";
  const params: any[] = [];

  if (filters?.jobId) {
    query += " AND job_id = ?";
    params.push(filters.jobId);
  }

  query += " ORDER BY created_at DESC";

  if (filters?.limit) {
    query += " LIMIT ?";
    params.push(filters.limit);
  }

  if (filters?.offset) {
    query += " OFFSET ?";
    params.push(filters.offset);
  }

  const rows = db.prepare(query).all(...params) as SuggestionRow[];
  return rows.map((row) => {
    const suggestion = rowToSuggestion(row);

    // Join with applicant data if human suggested
    if (row.suggested_applicant_id) {
      const applicant = getApplicant(db, row.suggested_applicant_id);
      if (applicant) {
        suggestion.applicant = applicant;
      }
    }

    return suggestion;
  });
}

// =============================================================================
// UTILITIES
// =============================================================================

function rowToSuggestion(row: SuggestionRow): Suggestion {
  return {
    id: row.id,
    jobId: row.job_id,
    suggestedApplicantId: row.suggested_applicant_id,
    suggestXai: row.suggest_xai === 1,
    reasoning: row.reasoning,
    confidenceScore: row.confidence_score,
    createdAt: row.created_at,
  };
}
