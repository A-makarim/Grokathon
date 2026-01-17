/**
 * Stats Storage Operations
 */

import type Database from "better-sqlite3";

export interface StorageStats {
  totalMarkets: number;
  openMarkets: number;
  resolvedMarkets: number;
  totalVolume: number;
  totalTrades: number;
  totalTraders: number;
}

export interface JobStats {
  totalJobs: number;
  pendingJobs: number;
  openJobs: number;
  completedJobs: number;
  totalApplicants: number;
  totalApplications: number;
  totalUsers: number;
}

export function getStats(db: Database.Database): StorageStats {
  const marketStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
      SUM(CASE WHEN status IN ('RESOLVED_YES', 'RESOLVED_NO') THEN 1 ELSE 0 END) as resolved,
      COALESCE(SUM(total_volume), 0) as volume
    FROM markets
  `).get() as { total: number; open: number | null; resolved: number | null; volume: number };

  const { trades } = db.prepare("SELECT COUNT(*) as trades FROM trades").get() as { trades: number };
  const { traders } = db.prepare("SELECT COUNT(*) as traders FROM traders").get() as { traders: number };

  return {
    totalMarkets: marketStats.total || 0,
    openMarkets: marketStats.open || 0,
    resolvedMarkets: marketStats.resolved || 0,
    totalVolume: marketStats.volume || 0,
    totalTrades: trades || 0,
    totalTraders: traders || 0,
  };
}

export function getJobStats(db: Database.Database): JobStats {
  const jobStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
    FROM jobs
  `).get() as { total: number; pending: number | null; open: number | null; completed: number | null };

  const { applicants } = db.prepare("SELECT COUNT(*) as applicants FROM applicants").get() as { applicants: number };
  const { applications } = db.prepare("SELECT COUNT(*) as applications FROM applications").get() as { applications: number };
  const { users } = db.prepare("SELECT COUNT(*) as users FROM users").get() as { users: number };

  return {
    totalJobs: jobStats.total || 0,
    pendingJobs: jobStats.pending || 0,
    openJobs: jobStats.open || 0,
    completedJobs: jobStats.completed || 0,
    totalApplicants: applicants || 0,
    totalApplications: applications || 0,
    totalUsers: users || 0,
  };
}
