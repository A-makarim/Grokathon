/**
 * SQLite Storage Layer for Market Registry
 * 
 * Fast, persistent storage for all market data.
 * Uses better-sqlite3 for synchronous operations.
 */

import Database from "better-sqlite3";
import type {
  RegistryMarket,
  CreateMarketInput,
  Order,
  Trade,
  Trader,
  User,
  UserRole,
  MarketStatus,
  TokenType,
  OrderStatus,
  Job,
  JobStatus,
  JobComplexity,
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
} from "../types.js";
import { SCHEMA } from "./schema.js";
import { JOB_SCHEMA } from "./job-schema.js";
import * as users from "./users.js";
import * as markets from "./markets.js";
import * as traders from "./traders.js";
import * as orders from "./orders.js";
import * as trades from "./trades.js";
import * as stats from "./stats.js";
import * as jobs from "./jobs.js";
import * as applicants from "./applicants.js";
import * as applications from "./applications.js";
import * as suggestions from "./suggestions.js";

// =============================================================================
// STORAGE CLASS
// =============================================================================

export class MarketStorage {
  private db: Database.Database;

  constructor(dbPath: string = "markets.db") {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(SCHEMA);
    this.db.exec(JOB_SCHEMA); // Add job marketplace tables
  }

  // ===========================================================================
  // USER OPERATIONS
  // ===========================================================================

  createUser(input: { name: string; role?: UserRole; twitterHandle?: string }): User {
    return users.createUser(this.db, input);
  }

  getUser(id: string): User | undefined {
    return users.getUser(this.db, id);
  }

  getUserByToken(token: string): User | undefined {
    return users.getUserByToken(this.db, token);
  }

  getUserByTraderId(traderId: string): User | undefined {
    return users.getUserByTraderId(this.db, traderId);
  }

  getUserByTwitterHandle(handle: string): User | undefined {
    return users.getUserByTwitterHandle(this.db, handle);
  }

  listUsers(offset = 0, limit = 50): { users: User[]; total: number } {
    return users.listUsers(this.db, offset, limit);
  }

  updateUser(user: User): void {
    users.updateUser(this.db, user);
  }

  // ===========================================================================
  // MARKET OPERATIONS
  // ===========================================================================

  createMarket(input: CreateMarketInput): RegistryMarket {
    return markets.createMarket(this.db, input);
  }

  getMarket(id: string): RegistryMarket | undefined {
    return markets.getMarket(this.db, id);
  }

  updateMarket(market: RegistryMarket): void {
    markets.updateMarket(this.db, market);
  }

  listMarkets(status?: MarketStatus[], offset = 0, limit = 50): { markets: RegistryMarket[]; total: number } {
    return markets.listMarkets(this.db, status, offset, limit);
  }

  getMarketsExpiringSoon(withinHours: number): RegistryMarket[] {
    return markets.getMarketsExpiringSoon(this.db, withinHours);
  }

  marketExists(id: string): boolean {
    return markets.marketExists(this.db, id);
  }

  // ===========================================================================
  // TRADER OPERATIONS
  // ===========================================================================

  createTrader(id: string): Trader {
    return traders.createTrader(this.db, id);
  }

  getTrader(id: string): Trader | undefined {
    return traders.getTrader(this.db, id);
  }

  updateTrader(trader: Trader): void {
    traders.updateTrader(this.db, trader);
  }

  traderExists(id: string): boolean {
    return traders.traderExists(this.db, id);
  }

  getTradersWithPositionsInMarket(marketId: string): Trader[] {
    return traders.getTradersWithPositionsInMarket(this.db, marketId);
  }

  getTraderStats(traderId: string): traders.TraderStats | undefined {
    return traders.getTraderStats(this.db, traderId);
  }

  getTraderLeaderboard(limit = 50, offset = 0): { traders: traders.TraderStats[]; total: number } {
    return traders.getTraderLeaderboard(this.db, limit, offset);
  }

  // ===========================================================================
  // ORDER OPERATIONS
  // ===========================================================================

  createOrder(order: Order): void {
    orders.createOrder(this.db, order);
  }

  getOrder(id: string): Order | undefined {
    return orders.getOrder(this.db, id);
  }

  updateOrder(order: Order): void {
    orders.updateOrder(this.db, order);
  }

  getOrdersForMarket(marketId: string, status?: OrderStatus[]): Order[] {
    return orders.getOrdersForMarket(this.db, marketId, status);
  }

  getOrdersForTrader(traderId: string, status?: OrderStatus[]): Order[] {
    return orders.getOrdersForTrader(this.db, traderId, status);
  }

  getActiveOrdersForMarketAndToken(marketId: string, tokenType: TokenType): { bids: Order[]; asks: Order[] } {
    return orders.getActiveOrdersForMarketAndToken(this.db, marketId, tokenType);
  }

  cancelOrdersForMarket(marketId: string): void {
    orders.cancelOrdersForMarket(this.db, marketId);
  }

  // ===========================================================================
  // TRADE OPERATIONS
  // ===========================================================================

  createTrade(trade: Trade): void {
    trades.createTrade(this.db, trade);
  }

  getTradesForMarket(marketId: string, limit = 50): Trade[] {
    return trades.getTradesForMarket(this.db, marketId, limit);
  }

  getTradesForTrader(traderId: string, limit = 50): Trade[] {
    return trades.getTradesForTrader(this.db, traderId, limit);
  }

  // ===========================================================================
  // STATS
  // ===========================================================================

  getStats() {
    return stats.getStats(this.db);
  }

  getJobStats() {
    return stats.getJobStats(this.db);
  }

  // ===========================================================================
  // JOB OPERATIONS
  // ===========================================================================

  createJob(input: CreateJobInput): Job {
    return jobs.createJob(this.db, input);
  }

  getJob(id: string): Job | undefined {
    return jobs.getJob(this.db, id);
  }

  listJobs(filters?: JobFilters): Job[] {
    return jobs.listJobs(this.db, filters);
  }

  updateJob(id: string, updates: Partial<Job>): void {
    jobs.updateJob(this.db, id, updates);
  }

  approveJob(id: string, budget: number, approverId: string): void {
    jobs.approveJob(this.db, id, budget, approverId);
  }

  assignJob(id: string, assigneeId: string): void {
    jobs.assignJob(this.db, id, assigneeId);
  }

  completeJob(id: string): void {
    jobs.completeJob(this.db, id);
  }

  cancelJob(id: string): void {
    jobs.cancelJob(this.db, id);
  }

  // ===========================================================================
  // APPLICANT OPERATIONS
  // ===========================================================================

  createApplicant(input: CreateApplicantInput): Applicant {
    return applicants.createApplicant(this.db, input);
  }

  upsertApplicant(input: CreateApplicantInput): Applicant {
    return applicants.upsertApplicant(this.db, input);
  }

  getApplicant(id: string): Applicant | undefined {
    return applicants.getApplicant(this.db, id);
  }

  getApplicantByTwitter(handle: string): Applicant | undefined {
    return applicants.getApplicantByTwitter(this.db, handle);
  }

  listApplicants(filters?: ApplicantFilters): Applicant[] {
    return applicants.listApplicants(this.db, filters);
  }

  updateApplicant(id: string, updates: Partial<Applicant>): void {
    applicants.updateApplicant(this.db, id, updates);
  }

  // ===========================================================================
  // APPLICATION OPERATIONS
  // ===========================================================================

  createApplication(input: CreateApplicationInput): Application {
    return applications.createApplication(this.db, input);
  }

  getApplication(id: string): Application | undefined {
    return applications.getApplication(this.db, id);
  }

  listApplicationsByJob(jobId: string): Application[] {
    return applications.listApplicationsByJob(this.db, jobId);
  }

  listApplicationsByApplicant(applicantId: string): Application[] {
    return applications.listApplicationsByApplicant(this.db, applicantId);
  }

  listApplications(filters?: ApplicationFilters): Application[] {
    return applications.listApplications(this.db, filters);
  }

  updateApplicationSummary(id: string, summary: string): void {
    applications.updateApplicationSummary(this.db, id, summary);
  }

  updateApplicationStatus(id: string, status: ApplicationStatus): void {
    applications.updateApplicationStatus(this.db, id, status);
  }

  // ===========================================================================
  // SUGGESTION OPERATIONS
  // ===========================================================================

  createSuggestion(input: CreateSuggestionInput): Suggestion {
    return suggestions.createSuggestion(this.db, input);
  }

  getSuggestion(id: string): Suggestion | undefined {
    return suggestions.getSuggestion(this.db, id);
  }

  getSuggestionByJob(jobId: string): Suggestion | undefined {
    return suggestions.getSuggestionByJob(this.db, jobId);
  }

  listSuggestions(filters?: SuggestionFilters): Suggestion[] {
    return suggestions.listSuggestions(this.db, filters);
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  close(): void {
    this.db.close();
  }
}

/**
 * Create an isolated storage instance for testing
 * Uses in-memory SQLite (":memory:")
 */
export function createTestStorage(): MarketStorage {
  return new MarketStorage(":memory:");
}
