/**
 * Applicant Storage Operations
 */

import type Database from "better-sqlite3";
import type { ApplicantRow } from "./job-schema.js";
import type {
  Applicant,
  CreateApplicantInput,
  ApplicantFilters,
} from "../types.js";

// =============================================================================
// CREATE
// =============================================================================

export function createApplicant(db: Database.Database, input: CreateApplicantInput): Applicant {
  const stmt = db.prepare(`
    INSERT INTO applicants (
      id, name, email, twitter_handle, bio, skills, portfolio_url, avatar_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    input.id,
    input.name,
    input.email || null,
    input.twitterHandle || null,
    input.bio || null,
    JSON.stringify(input.skills || []),
    input.portfolioUrl || null,
    input.avatarUrl || null,
    input.createdAt
  );

  return getApplicant(db, input.id)!;
}

export function upsertApplicant(db: Database.Database, input: CreateApplicantInput): Applicant {
  // Check if applicant exists by Twitter handle
  if (input.twitterHandle) {
    const existing = getApplicantByTwitter(db, input.twitterHandle);
    if (existing) {
      // Update existing applicant
      updateApplicant(db, existing.id, {
        name: input.name,
        email: input.email,
        bio: input.bio,
        skills: input.skills,
        portfolioUrl: input.portfolioUrl,
        avatarUrl: input.avatarUrl,
      });
      return getApplicant(db, existing.id)!;
    }
  }

  // Create new applicant
  return createApplicant(db, input);
}

// =============================================================================
// READ
// =============================================================================

export function getApplicant(db: Database.Database, id: string): Applicant | undefined {
  const row = db.prepare("SELECT * FROM applicants WHERE id = ?").get(id) as ApplicantRow | undefined;
  return row ? rowToApplicant(row) : undefined;
}

export function getApplicantByTwitter(db: Database.Database, handle: string): Applicant | undefined {
  const row = db.prepare("SELECT * FROM applicants WHERE twitter_handle = ?").get(handle) as ApplicantRow | undefined;
  return row ? rowToApplicant(row) : undefined;
}

export function listApplicants(db: Database.Database, filters?: ApplicantFilters): Applicant[] {
  let query = "SELECT * FROM applicants ORDER BY created_at DESC";
  const params: any[] = [];

  if (filters?.limit) {
    query += " LIMIT ?";
    params.push(filters.limit);
  }

  if (filters?.offset) {
    query += " OFFSET ?";
    params.push(filters.offset);
  }

  const rows = db.prepare(query).all(...params) as ApplicantRow[];
  return rows.map(rowToApplicant);
}

// =============================================================================
// UPDATE
// =============================================================================

export function updateApplicant(db: Database.Database, id: string, updates: Partial<Applicant>): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (updates.email !== undefined) {
    fields.push("email = ?");
    values.push(updates.email);
  }

  if (updates.bio !== undefined) {
    fields.push("bio = ?");
    values.push(updates.bio);
  }

  if (updates.skills !== undefined) {
    fields.push("skills = ?");
    values.push(JSON.stringify(updates.skills));
  }

  if (updates.portfolioUrl !== undefined) {
    fields.push("portfolio_url = ?");
    values.push(updates.portfolioUrl);
  }

  if (updates.avatarUrl !== undefined) {
    fields.push("avatar_url = ?");
    values.push(updates.avatarUrl);
  }

  if (fields.length === 0) return;

  values.push(id);
  const stmt = db.prepare(`UPDATE applicants SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
}

// =============================================================================
// UTILITIES
// =============================================================================

function rowToApplicant(row: ApplicantRow): Applicant {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    twitterHandle: row.twitter_handle,
    bio: row.bio,
    skills: JSON.parse(row.skills),
    portfolioUrl: row.portfolio_url,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}
