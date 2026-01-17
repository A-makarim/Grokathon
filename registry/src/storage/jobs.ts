/**
 * Job Storage Operations
 */

import type Database from "better-sqlite3";
import type { JobRow } from "./job-schema.js";
import type {
  Job,
  JobStatus,
  JobComplexity,
  CreateJobInput,
  JobFilters,
} from "../types.js";

// =============================================================================
// CREATE
// =============================================================================

export function createJob(db: Database.Database, input: CreateJobInput): Job {
  const stmt = db.prepare(`
    INSERT INTO jobs (
      id, title, description, requirements, complexity,
      source_tweet_id, source_tweet_url, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL')
  `);

  stmt.run(
    input.id,
    input.title,
    input.description,
    input.requirements || null,
    input.complexity || null,
    input.sourceTweetId || null,
    input.sourceTweetUrl || null,
    input.createdAt
  );

  return getJob(db, input.id)!;
}

// =============================================================================
// READ
// =============================================================================

export function getJob(db: Database.Database, id: string): Job | undefined {
  const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
  return row ? rowToJob(row) : undefined;
}

export function listJobs(db: Database.Database, filters?: JobFilters): Job[] {
  let query = "SELECT * FROM jobs WHERE 1=1";
  const params: any[] = [];

  if (filters?.status && filters.status.length > 0) {
    const placeholders = filters.status.map(() => "?").join(",");
    query += ` AND status IN (${placeholders})`;
    params.push(...filters.status);
  }

  if (filters?.complexity && filters.complexity.length > 0) {
    const placeholders = filters.complexity.map(() => "?").join(",");
    query += ` AND complexity IN (${placeholders})`;
    params.push(...filters.complexity);
  }

  if (filters?.createdBy) {
    query += ` AND created_by = ?`;
    params.push(filters.createdBy);
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

  const rows = db.prepare(query).all(...params) as JobRow[];
  return rows.map(rowToJob);
}

// =============================================================================
// UPDATE
// =============================================================================

export function updateJob(db: Database.Database, id: string, updates: Partial<Job>): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (updates.budget !== undefined) {
    fields.push("budget = ?");
    values.push(updates.budget);
  }

  if (updates.approvedAt !== undefined) {
    fields.push("approved_at = ?");
    values.push(updates.approvedAt);
  }

  if (updates.assignedTo !== undefined) {
    fields.push("assigned_to = ?");
    values.push(updates.assignedTo);
  }

  if (updates.completedAt !== undefined) {
    fields.push("completed_at = ?");
    values.push(updates.completedAt);
  }

  if (updates.createdBy !== undefined) {
    fields.push("created_by = ?");
    values.push(updates.createdBy);
  }

  if (fields.length === 0) return;

  values.push(id);
  const stmt = db.prepare(`UPDATE jobs SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
}

export function approveJob(
  db: Database.Database,
  id: string,
  budget: number,
  approverId: string
): void {
  const stmt = db.prepare(`
    UPDATE jobs SET
      status = 'OPEN',
      budget = ?,
      approved_at = ?,
      created_by = ?
    WHERE id = ?
  `);

  stmt.run(budget, new Date().toISOString(), approverId, id);
}

export function assignJob(db: Database.Database, id: string, assigneeId: string): void {
  const stmt = db.prepare(`
    UPDATE jobs SET
      status = 'IN_PROGRESS',
      assigned_to = ?
    WHERE id = ?
  `);

  stmt.run(assigneeId, id);
}

export function completeJob(db: Database.Database, id: string): void {
  const stmt = db.prepare(`
    UPDATE jobs SET
      status = 'COMPLETED',
      completed_at = ?
    WHERE id = ?
  `);

  stmt.run(new Date().toISOString(), id);
}

export function cancelJob(db: Database.Database, id: string): void {
  const stmt = db.prepare("UPDATE jobs SET status = 'CANCELLED' WHERE id = ?");
  stmt.run(id);
}

// =============================================================================
// UTILITIES
// =============================================================================

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    budget: row.budget,
    status: row.status as JobStatus,
    complexity: row.complexity as JobComplexity | null,
    sourceTweetId: row.source_tweet_id,
    sourceTweetUrl: row.source_tweet_url,
    createdBy: row.created_by,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    assignedTo: row.assigned_to,
    completedAt: row.completed_at,
  };
}
