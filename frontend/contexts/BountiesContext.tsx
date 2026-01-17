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

// Extract Twitter handle from tweet URL (e.g., https://twitter.com/keerthanenr/status/123)
function extractTwitterHandle(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/);
  return match ? match[1] : undefined;
}

// Generate Twitter avatar URL from handle
function getTwitterAvatarUrl(handle: string | undefined): string | undefined {
  if (!handle) return undefined;
  // Remove @ prefix if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
  // Use unavatar.io service which provides Twitter profile images
  return `https://unavatar.io/twitter/${cleanHandle}`;
}

// Convert Job from API to Bounty for UI
function jobToBounty(job: Job): Bounty {
  // Priority: 1) Extract from source tweet URL, 2) Use enriched creator info, 3) Fallback
  const tweetAuthor = extractTwitterHandle(job.sourceTweetUrl);
  const creatorName = tweetAuthor || job.creator?.name || 'Bounty Creator';
  const creatorHandle = tweetAuthor 
    ? `@${tweetAuthor}`
    : job.creator?.twitterHandle 
      ? (job.creator.twitterHandle.startsWith('@') ? job.creator.twitterHandle : `@${job.creator.twitterHandle}`)
      : undefined;
  
  // Get the raw handle for avatar URL (without @)
  const rawHandle = tweetAuthor || job.creator?.twitterHandle?.replace('@', '');
  const avatarUrl = getTwitterAvatarUrl(rawHandle);
  
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    category: 'development', // Default category
    reward: job.budget || 0,
    currency: 'USD',
    status: jobStatusToBountyStatus(job.status),
    poster: {
      id: tweetAuthor || job.creator?.id || job.createdBy || 'system',
      name: creatorName,
      role: 'user',
      twitterHandle: creatorHandle,
      avatar: avatarUrl,
      createdAt: job.createdAt,
    },
    postedAt: new Date(job.createdAt),
    tags: [], // Tags would come from job metadata if available
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
      console.error('Failed to fetch bounties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bounties');
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
