/**
 * SIG Arena Job Marketplace Registry
 * 
 * Core registry for the job marketplace platform.
 * Handles jobs, applicants, applications, and suggestions.
 */

import { MarketStorage } from "./storage/index.js";
import type {
  User,
  UserRole,
  Job,
  CreateJobInput,
  JobFilters,
  Applicant,
  CreateApplicantInput,
  ApplicantFilters,
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  ApplicationFilters,
  Suggestion,
  CreateSuggestionInput,
  SuggestionFilters,
  XaiWork,
  XaiWorkStatus,
} from "./types.js";

// =============================================================================
// JOB MARKETPLACE REGISTRY
// =============================================================================

export class JobRegistry {
  private storage: MarketStorage;

  constructor(dbPath: string = "jobs.db") {
    this.storage = new MarketStorage(dbPath);
  }

  /**
   * Create a test registry with isolated in-memory storage
   */
  static createTestRegistry(): JobRegistry {
    return new JobRegistry(":memory:");
  }

  // ===========================================================================
  // USER OPERATIONS
  // ===========================================================================

  createUser(input: { name: string; role?: UserRole; twitterHandle?: string }): User {
    return this.storage.createUser(input);
  }

  getUser(id: string): User | undefined {
    return this.storage.getUser(id);
  }

  getUserByToken(token: string): User | undefined {
    return this.storage.getUserByToken(token);
  }

  getUserByTwitterHandle(handle: string): User | undefined {
    return this.storage.getUserByTwitterHandle(handle);
  }

  listUsers(offset = 0, limit = 50): { users: User[]; total: number } {
    return this.storage.listUsers(offset, limit);
  }

  updateUser(user: User): void {
    this.storage.updateUser(user);
  }

  // ===========================================================================
  // JOB OPERATIONS
  // ===========================================================================

  createJob(input: CreateJobInput): Job {
    return this.storage.createJob(input);
  }

  getJob(id: string): Job | undefined {
    return this.storage.getJob(id);
  }

  listJobs(filters?: JobFilters): Job[] {
    return this.storage.listJobs(filters);
  }

  approveJob(id: string, budget: number, approverId: string): void {
    this.storage.approveJob(id, budget, approverId);
  }

  assignJob(id: string, assigneeId: string): void {
    this.storage.assignJob(id, assigneeId);
  }

  completeJob(id: string): void {
    this.storage.completeJob(id);
  }

  cancelJob(id: string): void {
    this.storage.cancelJob(id);
  }

  // ===========================================================================
  // APPLICANT OPERATIONS
  // ===========================================================================

  createApplicant(input: CreateApplicantInput): Applicant {
    return this.storage.createApplicant(input);
  }

  upsertApplicant(input: CreateApplicantInput): Applicant {
    return this.storage.upsertApplicant(input);
  }

  getApplicant(id: string): Applicant | undefined {
    return this.storage.getApplicant(id);
  }

  getApplicantByTwitter(handle: string): Applicant | undefined {
    return this.storage.getApplicantByTwitter(handle);
  }

  listApplicants(filters?: ApplicantFilters): Applicant[] {
    return this.storage.listApplicants(filters);
  }

  updateApplicant(id: string, updates: Partial<Applicant>): void {
    this.storage.updateApplicant(id, updates);
  }

  // ===========================================================================
  // APPLICATION OPERATIONS
  // ===========================================================================

  createApplication(input: CreateApplicationInput): Application {
    return this.storage.createApplication(input);
  }

  getApplication(id: string): Application | undefined {
    return this.storage.getApplication(id);
  }

  listApplicationsByJob(jobId: string): Application[] {
    return this.storage.listApplicationsByJob(jobId);
  }

  listApplicationsByApplicant(applicantId: string): Application[] {
    return this.storage.listApplicationsByApplicant(applicantId);
  }

  listApplications(filters?: ApplicationFilters): Application[] {
    return this.storage.listApplications(filters);
  }

  updateApplicationSummary(id: string, summary: string): void {
    this.storage.updateApplicationSummary(id, summary);
  }

  updateApplicationStatus(id: string, status: ApplicationStatus): void {
    this.storage.updateApplicationStatus(id, status);
  }

  // ===========================================================================
  // SUGGESTION OPERATIONS
  // ===========================================================================

  createSuggestion(input: CreateSuggestionInput): Suggestion {
    return this.storage.createSuggestion(input);
  }

  getSuggestion(id: string): Suggestion | undefined {
    return this.storage.getSuggestion(id);
  }

  getSuggestionByJob(jobId: string): Suggestion | undefined {
    return this.storage.getSuggestionByJob(jobId);
  }

  listSuggestions(filters?: SuggestionFilters): Suggestion[] {
    return this.storage.listSuggestions(filters);
  }

  // ===========================================================================
  // XAI WORK OPERATIONS
  // ===========================================================================

  createXaiWork(jobId: string): XaiWork {
    return this.storage.createXaiWork(jobId);
  }

  getXaiWork(id: string): XaiWork | undefined {
    return this.storage.getXaiWork(id);
  }

  getXaiWorkByJob(jobId: string): XaiWork | undefined {
    return this.storage.getXaiWorkByJob(jobId);
  }

  updateXaiWorkStatus(id: string, status: XaiWorkStatus): void {
    this.storage.updateXaiWorkStatus(id, status);
  }

  saveXaiWorkOutput(id: string, output: string, artifacts?: string[], executionNotes?: string): void {
    this.storage.saveXaiWorkOutput(id, output, artifacts, executionNotes);
  }

  saveXaiWorkError(id: string, errorMessage: string): void {
    this.storage.saveXaiWorkError(id, errorMessage);
  }

  listPendingXaiWork(limit = 50): XaiWork[] {
    return this.storage.listPendingXaiWork(limit);
  }

  // ===========================================================================
  // STATS
  // ===========================================================================

  getStats(): {
    totalJobs: number;
    pendingJobs: number;
    openJobs: number;
    completedJobs: number;
    totalApplicants: number;
    totalApplications: number;
    totalUsers: number;
  } {
    return this.storage.getJobStats();
  }
}

// Alias for backward compatibility during migration
export { JobRegistry as MarketRegistry };
