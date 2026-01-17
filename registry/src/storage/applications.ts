/**
 * Application Storage Operations
 */

import type Database from "better-sqlite3";
import type { ApplicationRow } from "./job-schema.js";
import { getApplicant } from "./applicants.js";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  ApplicationFilters,
} from "../types.js";

// =============================================================================
// CREATE
// =============================================================================

export function createApplication(db: Database.Database, input: CreateApplicationInput): Application {
  const stmt = db.prepare(`
    INSERT INTO applications (
      id, job_id, applicant_id, cover_letter, applied_at, status
    ) VALUES (?, ?, ?, ?, ?, 'PENDING')
  `);

  stmt.run(
    input.id,
    input.jobId,
    input.applicantId,
    input.coverLetter || null,
    input.appliedAt
  );

  return getApplication(db, input.id)!;
}

// =============================================================================
// READ
// =============================================================================

export function getApplication(db: Database.Database, id: string): Application | undefined {
  const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as ApplicationRow | undefined;
  if (!row) return undefined;

  const application = rowToApplication(row);

  // Join with applicant data
  const applicant = getApplicant(db, row.applicant_id);
  if (applicant) {
    application.applicant = applicant;
  }

  return application;
}

export function listApplicationsByJob(db: Database.Database, jobId: string): Application[] {
  const rows = db.prepare("SELECT * FROM applications WHERE job_id = ? ORDER BY applied_at DESC")
    .all(jobId) as ApplicationRow[];

  return rows.map((row) => {
    const application = rowToApplication(row);
    const applicant = getApplicant(db, row.applicant_id);
    if (applicant) {
      application.applicant = applicant;
    }
    return application;
  });
}

export function listApplicationsByApplicant(db: Database.Database, applicantId: string): Application[] {
  const rows = db.prepare("SELECT * FROM applications WHERE applicant_id = ? ORDER BY applied_at DESC")
    .all(applicantId) as ApplicationRow[];

  return rows.map(rowToApplication);
}

export function listApplications(db: Database.Database, filters?: ApplicationFilters): Application[] {
  let query = "SELECT * FROM applications WHERE 1=1";
  const params: any[] = [];

  if (filters?.jobId) {
    query += " AND job_id = ?";
    params.push(filters.jobId);
  }

  if (filters?.applicantId) {
    query += " AND applicant_id = ?";
    params.push(filters.applicantId);
  }

  if (filters?.status && filters.status.length > 0) {
    const placeholders = filters.status.map(() => "?").join(",");
    query += ` AND status IN (${placeholders})`;
    params.push(...filters.status);
  }

  query += " ORDER BY applied_at DESC";

  if (filters?.limit) {
    query += " LIMIT ?";
    params.push(filters.limit);
  }

  if (filters?.offset) {
    query += " OFFSET ?";
    params.push(filters.offset);
  }

  const rows = db.prepare(query).all(...params) as ApplicationRow[];
  return rows.map(rowToApplication);
}

// =============================================================================
// UPDATE
// =============================================================================

export function updateApplicationSummary(db: Database.Database, id: string, summary: string): void {
  const stmt = db.prepare("UPDATE applications SET profile_summary = ? WHERE id = ?");
  stmt.run(summary, id);
}

export function updateApplicationStatus(
  db: Database.Database,
  id: string,
  status: ApplicationStatus
): void {
  const stmt = db.prepare("UPDATE applications SET status = ? WHERE id = ?");
  stmt.run(status, id);
}

// =============================================================================
// UTILITIES
// =============================================================================

function rowToApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    coverLetter: row.cover_letter,
    profileSummary: row.profile_summary,
    appliedAt: row.applied_at,
    status: row.status as ApplicationStatus,
  };
}
