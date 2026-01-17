'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Bounty, Job, JobComplexity } from '@/lib/types';
import { jobStatusToBountyStatus } from '@/lib/utils';
import api from '@/lib/api';

interface BountiesContextType {
  bounties: Bounty[];
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  bookmarkedBountyIds: Set<string>;
  toggleBookmark: (bountyId: string) => void;
  refreshBounties: () => Promise<void>;
  getJobById: (id: string) => Job | undefined;
}

const BountiesContext = createContext<BountiesContextType | undefined>(undefined);

// Convert Job from API to Bounty for UI
function jobToBounty(job: Job): Bounty {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    category: 'development', // Default category
    reward: job.budget || 0,
    currency: 'USD',
    status: jobStatusToBountyStatus(job.status),
    poster: {
      id: job.createdBy || 'system',
      name: 'Job Creator',
      role: 'user',
      twitterHandle: '@xbounty',
      createdAt: job.createdAt,
    },
    postedAt: new Date(job.createdAt),
    tags: job.complexity ? [job.complexity.toLowerCase()] : [],
    applicantCount: 0,
    viewCount: 0,
    bookmarkCount: 0,
    requirements: job.requirements || undefined,
    complexity: job.complexity || undefined,
    sourceTweetUrl: job.sourceTweetUrl || undefined,
  };
}

export function BountiesProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [bookmarkedBountyIds, setBookmarkedBountyIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBounties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { jobs: openJobs } = await api.getOpenJobs({ limit: 100 });
      setJobs(openJobs);
      setBounties(openJobs.map(jobToBounty));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBounties();
    // Poll for updates every 30 seconds
    const interval = setInterval(refreshBounties, 30000);
    return () => clearInterval(interval);
  }, [refreshBounties]);

  const toggleBookmark = (bountyId: string) => {
    setBookmarkedBountyIds((prev) => {
      const next = new Set(prev);
      if (next.has(bountyId)) {
        next.delete(bountyId);
      } else {
        next.add(bountyId);
      }
      return next;
    });
  };

  const getJobById = (id: string) => jobs.find(j => j.id === id);

  return (
    <BountiesContext.Provider
      value={{
        bounties,
        jobs,
        isLoading,
        error,
        bookmarkedBountyIds,
        toggleBookmark,
        refreshBounties,
        getJobById,
      }}
    >
      {children}
    </BountiesContext.Provider>
  );
}

export function useBounties() {
  const context = useContext(BountiesContext);
  if (context === undefined) {
    throw new Error('useBounties must be used within a BountiesProvider');
  }
  return context;
}
