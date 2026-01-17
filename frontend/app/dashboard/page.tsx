'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { JobGrid, JobGridSkeleton } from '@/components/bounties/JobGrid';
import { JobDetailModal } from '@/components/bounties/JobDetailModal';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Job, Application, Suggestion, Applicant } from '@/lib/types';

type DashboardTab = 'open' | 'in_progress' | 'completed' | 'all';

interface JobWithApplications extends Job {
  applications: Application[];
  suggestion?: Suggestion;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading: userLoading, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<DashboardTab>('open');
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithApplications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract Twitter handle from tweet URL (e.g., https://twitter.com/keerthanenr/status/123)
  const extractTwitterHandle = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/);
    return match ? match[1].toLowerCase() : undefined;
  };

  // Fetch jobs and their applications
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { jobs: openJobs } = await api.getOpenJobs({ limit: 100 });
      
      // Filter jobs to only show those created by the current user
      // Match by: 1) createdBy ID, 2) Twitter handle from source tweet URL
      const userHandle = currentUser.twitterHandle?.replace('@', '').toLowerCase();
      const myJobs = openJobs.filter((job: Job) => {
        // Direct ID match
        if (job.createdBy === currentUser.id) return true;
        // Match by Twitter handle from source tweet URL
        const tweetAuthor = extractTwitterHandle(job.sourceTweetUrl);
        if (userHandle && tweetAuthor && tweetAuthor === userHandle) return true;
        return false;
      });
      
      // For each job, fetch applications
      const jobsWithApps: JobWithApplications[] = await Promise.all(
        myJobs.map(async (job: Job) => {
          let applications: Application[] = [];
          let suggestion: Suggestion | undefined;
          
          try {
            const { applications: apps } = await api.getApplicationsForJob(job.id);
            applications = apps;
          } catch (e) {
            // Not authorized or no applications
          }

          try {
            suggestion = await api.getSuggestionForJob(job.id);
          } catch (e) {
            // No suggestion yet
          }

          return { ...job, applications, suggestion };
        })
      );

      setJobs(jobsWithApps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (!userLoading && isAuthenticated) {
      fetchData();
    }
  }, [userLoading, isAuthenticated, fetchData]);

  // Generate suggestion for selected job
  const handleGenerateSuggestion = async () => {
    if (!selectedJob) return;

    setIsGeneratingSuggestion(true);
    setError(null);

    try {
      // Trigger suggestion generation (returns 202 immediately)
      await api.generateSuggestion(selectedJob.id);

      // Poll for the result every 2 seconds for up to 30 seconds
      const maxAttempts = 15;
      let attempts = 0;

      const pollForSuggestion = async (): Promise<Suggestion | null> => {
        attempts++;

        try {
          const suggestion = await api.getSuggestionForJob(selectedJob.id);
          return suggestion;
        } catch (err) {
          // Suggestion not ready yet
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return pollForSuggestion();
          }
          return null;
        }
      };

      const suggestion = await pollForSuggestion();

      if (suggestion) {
        // Update the job with the new suggestion
        setJobs(prev => prev.map(j =>
          j.id === selectedJob.id ? { ...j, suggestion } : j
        ));
        setSelectedJob(prev => prev ? { ...prev, suggestion } : null);
      } else {
        setError('Suggestion generation timed out. Please refresh the page in a few seconds.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestion');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // Assign job to applicant
  const handleAssign = async (applicantId: string) => {
    if (!selectedJob) return;

    try {
      await api.assignJob(selectedJob.id, applicantId);
      await fetchData();
      setSelectedJob(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign job');
    }
  };

  // Close/complete job
  const handleCloseJob = async () => {
    if (!selectedJob) return;

    try {
      await api.completeJob(selectedJob.id);
      await fetchData();
      setSelectedJob(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close job');
    }
  };

  // Handle job selection
  const handleSelectJob = (job: JobWithApplications) => {
    setSelectedJob(job);
  };

  if (userLoading) {
    return (
      <MainLayout>
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#1D9BF0] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#71767B]">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1D9BF0]/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#1D9BF0]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-[#E7E9EA] mb-2">Connect to view Dashboard</h2>
          <p className="text-[15px] text-[#71767B] mb-6">
            Sign in with your Twitter/X username to access the admin dashboard and manage job applications.
          </p>
          <p className="text-[13px] text-[#71767B]">
            Click the <span className="text-[#1D9BF0] font-medium">Connect</span> button in the top right to get started.
          </p>
        </div>
      </MainLayout>
    );
  }

  const openJobs = jobs.filter(j => j.status === 'OPEN');
  const inProgressJobs = jobs.filter(j => j.status === 'IN_PROGRESS');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  const getDisplayedJobs = () => {
    switch (activeTab) {
      case 'open':
        return openJobs;
      case 'in_progress':
        return inProgressJobs;
      case 'completed':
        return completedJobs;
      case 'all':
      default:
        return jobs;
    }
  };

  const displayedJobs = getDisplayedJobs();

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#E7E9EA] mb-2">
            My Jobs
          </h1>
          <p className="text-[15px] text-[#71767B]">
            Manage your posted jobs, view applications, and get AI suggestions
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 border border-[#F4212E]/30 bg-[#F4212E]/10 rounded-xl">
            <p className="text-[#F4212E] text-[14px]">{error}</p>
            <button onClick={() => setError(null)} className="text-[#71767B] text-[12px] hover:underline mt-1">
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid - Inspiration style with borders */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-[#2F3336] mb-8">
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <p className="text-[13px] text-[#71767B] font-medium mb-2">My Jobs</p>
            <p className="text-[32px] font-bold text-[#E7E9EA]">{jobs.length}</p>
          </div>
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[13px] text-[#71767B] font-medium">Open</p>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-[32px] font-bold text-[#E7E9EA]">{openJobs.length}</p>
          </div>
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[13px] text-[#71767B] font-medium">In Progress</p>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <p className="text-[32px] font-bold text-[#E7E9EA]">{inProgressJobs.length}</p>
          </div>
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <p className="text-[13px] text-[#71767B] font-medium mb-2">Applications</p>
            <p className="text-[32px] font-bold text-[#1D9BF0]">
              {jobs.reduce((sum, j) => sum + j.applications.length, 0)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-[17px] font-bold text-[#E7E9EA] mb-3">Quick Actions</h2>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="primary">Browse Bounties</Button>
            </Link>
            <Link href="/applications">
              <Button variant="secondary">View Applications</Button>
            </Link>
            <Button variant="ghost" onClick={fetchData} disabled={isLoading}>
              {isLoading ? (
                          <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#71767B] border-t-transparent rounded-full animate-spin" />
                  Refreshing...
                          </span>
                        ) : (
                'Refresh Data'
                        )}
                      </Button>
                    </div>
                  </div>

        {/* Tabs */}
        <div className="border-b border-[#2F3336] mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('open')}
                          className={cn(
                'pb-3 text-[15px] font-medium transition-colors relative',
                activeTab === 'open'
                  ? 'text-[#E7E9EA]'
                  : 'text-[#71767B] hover:text-[#E7E9EA]'
              )}
            >
              Open Jobs ({openJobs.length})
              {activeTab === 'open' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={cn(
                'pb-3 text-[15px] font-medium transition-colors relative',
                activeTab === 'in_progress'
                  ? 'text-[#E7E9EA]'
                  : 'text-[#71767B] hover:text-[#E7E9EA]'
              )}
            >
              In Progress ({inProgressJobs.length})
              {activeTab === 'in_progress' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={cn(
                'pb-3 text-[15px] font-medium transition-colors relative',
                activeTab === 'completed'
                  ? 'text-[#E7E9EA]'
                  : 'text-[#71767B] hover:text-[#E7E9EA]'
              )}
            >
              Completed ({completedJobs.length})
              {activeTab === 'completed' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'pb-3 text-[15px] font-medium transition-colors relative',
                activeTab === 'all'
                  ? 'text-[#E7E9EA]'
                  : 'text-[#71767B] hover:text-[#E7E9EA]'
              )}
            >
              All ({jobs.length})
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading && jobs.length === 0 ? (
          <JobGridSkeleton />
        ) : (
          <JobGrid
            jobs={displayedJobs}
            selectedJobId={selectedJob?.id}
            onSelectJob={handleSelectJob}
          />
        )}

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onGenerateSuggestion={handleGenerateSuggestion}
          onAssign={handleAssign}
          onCloseJob={handleCloseJob}
          isGeneratingSuggestion={isGeneratingSuggestion}
          isAdmin={isAdmin}
          currentUserId={currentUser?.id}
          currentUserTwitterHandle={currentUser?.twitterHandle}
        />
      </div>
    </MainLayout>
  );
}
