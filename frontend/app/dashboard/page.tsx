'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUser } from '@/contexts/UserContext';
import { cn, formatTimeAgo, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Job, Application, Suggestion, Applicant } from '@/lib/types';

type DashboardTab = 'jobs' | 'applications';

interface JobWithApplications extends Job {
  applications: Application[];
  suggestion?: Suggestion;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading: userLoading, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<DashboardTab>('jobs');
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithApplications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs and their applications
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { jobs: openJobs } = await api.getOpenJobs({ limit: 100 });
      
      // For each job, fetch applications (admin only)
      const jobsWithApps: JobWithApplications[] = await Promise.all(
        openJobs.map(async (job: Job) => {
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!userLoading && isAuthenticated) {
      fetchData();
    }
  }, [userLoading, isAuthenticated, fetchData]);

  // Show connect prompt if not authenticated (removed redirect for demo)

  // Generate suggestion for selected job
  const handleGenerateSuggestion = async () => {
    if (!selectedJob) return;

    setIsGeneratingSuggestion(true);
    try {
      const suggestion = await api.generateSuggestion(selectedJob.id);
      
      // Update the job with the new suggestion
      setJobs(prev => prev.map(j => 
        j.id === selectedJob.id ? { ...j, suggestion } : j
      ));
      setSelectedJob(prev => prev ? { ...prev, suggestion } : null);
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

  if (isLoading && jobs.length === 0) {
    return (
      <MainLayout>
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#1D9BF0] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#71767B]">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  const openJobs = jobs.filter(j => j.status === 'OPEN');
  const inProgressJobs = jobs.filter(j => j.status === 'IN_PROGRESS');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#E7E9EA] mb-2">
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-[15px] text-[#71767B]">
            {isAdmin ? 'Manage jobs, view applications, and get AI suggestions' : 'Track your bounties and applications'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 border border-[#F4212E] bg-[#F4212E]/10 rounded-xl">
            <p className="text-[#F4212E] text-[14px]">{error}</p>
            <button onClick={() => setError(null)} className="text-[#71767B] text-[12px] hover:underline mt-1">
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">Open Jobs</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="text-[28px] font-bold text-[#E7E9EA]">{openJobs.length}</div>
          </div>

          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">In Progress</span>
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-[28px] font-bold text-[#E7E9EA]">{inProgressJobs.length}</div>
          </div>

          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">Completed</span>
              <svg viewBox="0 0 24 24" fill="#10B981" className="w-5 h-5">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </div>
            <div className="text-[28px] font-bold text-[#E7E9EA]">{completedJobs.length}</div>
          </div>

          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">Total Applications</span>
              <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-5 h-5">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="text-[28px] font-bold text-[#1D9BF0]">
              {jobs.reduce((sum, j) => sum + j.applications.length, 0)}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-1">
            <div className="border border-[#2F3336] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2F3336] bg-[#16181C]">
                <h2 className="text-[16px] font-bold text-[#E7E9EA]">Open Jobs</h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {openJobs.length === 0 ? (
                  <div className="p-6 text-center text-[#71767B] text-[14px]">
                    No open jobs yet
                  </div>
                ) : (
                  openJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={cn(
                        'w-full p-4 text-left border-b border-[#2F3336] last:border-b-0 hover:bg-[#16181C] transition-colors',
                        selectedJob?.id === job.id && 'bg-[#1D9BF0]/10 border-l-2 border-l-[#1D9BF0]'
                      )}
                    >
                      <h3 className="text-[14px] font-semibold text-[#E7E9EA] mb-1 line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-[12px] text-[#71767B] mb-2 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-[#1D9BF0]">{job.applications.length} applications</span>
                        <span className="text-[#71767B]">·</span>
                        <span className="text-[#71767B]">{formatTimeAgo(job.createdAt)}</span>
                        {job.suggestion && (
                          <>
                            <span className="text-[#71767B]">·</span>
                            <span className="text-[#00BA7C]">AI Suggestion Ready</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Job Details / Applications */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="border border-[#2F3336] rounded-xl overflow-hidden">
                {/* Job Header */}
                <div className="p-6 border-b border-[#2F3336] bg-[#16181C]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-[20px] font-bold text-[#E7E9EA] mb-2">{selectedJob.title}</h2>
                      <p className="text-[14px] text-[#71767B] line-clamp-2">{selectedJob.description}</p>
                      {selectedJob.sourceTweetUrl && (
                        <a
                          href={selectedJob.sourceTweetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-[#1D9BF0] hover:underline mt-2"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          View Source Tweet
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={handleGenerateSuggestion}
                        disabled={isGeneratingSuggestion || selectedJob.applications.length === 0}
                      >
                        {isGeneratingSuggestion ? 'Generating...' : '🤖 Get AI Suggestion'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* AI Suggestion Banner */}
                {selectedJob.suggestion && (
                  <div className="p-4 bg-gradient-to-r from-[#00BA7C]/10 to-transparent border-b border-[#2F3336]">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00BA7C]/20 flex items-center justify-center">
                        <span className="text-[16px]">🤖</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[14px] font-bold text-[#00BA7C] mb-1">
                          AI Recommendation
                          {selectedJob.suggestion.confidenceScore && (
                            <span className="ml-2 text-[12px] font-normal text-[#71767B]">
                              ({selectedJob.suggestion.confidenceScore}% confidence)
                            </span>
                          )}
                        </h4>
                        {selectedJob.suggestion.suggestXai ? (
                          <p className="text-[14px] text-[#E7E9EA]">
                            <strong>Recommend: xAI Agent</strong> - This task is suitable for AI automation.
                          </p>
                        ) : selectedJob.suggestion.applicant ? (
                          <p className="text-[14px] text-[#E7E9EA]">
                            <strong>Recommend: @{selectedJob.suggestion.applicant.twitterHandle}</strong>
                          </p>
                        ) : (
                          <p className="text-[14px] text-[#E7E9EA]">No recommendation available</p>
                        )}
                        {selectedJob.suggestion.reasoning && (
                          <p className="text-[12px] text-[#71767B] mt-2 line-clamp-3">
                            {selectedJob.suggestion.reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Applications List */}
                <div className="p-4">
                  <h3 className="text-[14px] font-bold text-[#E7E9EA] mb-4">
                    Applications ({selectedJob.applications.length})
                  </h3>
                  
                  {selectedJob.applications.length === 0 ? (
                    <div className="text-center py-8 text-[#71767B]">
                      <p className="text-[14px]">No applications yet</p>
                      <p className="text-[12px] mt-1">Applications will appear here when users apply</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedJob.applications.map((app: any) => (
                        <div
                          key={app.id}
                          className={cn(
                            'p-4 border border-[#2F3336] rounded-lg',
                            selectedJob.suggestion?.suggestedApplicantId === app.applicantId && 'border-[#00BA7C] bg-[#00BA7C]/5'
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[14px] font-semibold text-[#E7E9EA]">
                                  {app.applicant?.name || 'Anonymous'}
                                </span>
                                {app.applicant?.twitterHandle && (
                                  <a
                                    href={`https://x.com/${app.applicant.twitterHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[12px] text-[#1D9BF0] hover:underline"
                                  >
                                    @{app.applicant.twitterHandle}
                                  </a>
                                )}
                                {selectedJob.suggestion?.suggestedApplicantId === app.applicantId && (
                                  <Badge variant="success">AI Pick</Badge>
                                )}
                              </div>
                              
                              {app.coverLetter && (
                                <p className="text-[13px] text-[#71767B] mb-2">{app.coverLetter}</p>
                              )}

                              {app.applicant?.portfolioUrl && (
                                <a
                                  href={app.applicant.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[12px] text-[#1D9BF0] hover:underline"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                                  </svg>
                                  View Portfolio
                                </a>
                              )}

                              {/* Profile Summary from Profile Agent */}
                              {app.profileSummary && (
                                <div className="mt-3 p-3 bg-[#16181C] rounded border border-[#2F3336]">
                                  <h5 className="text-[11px] font-semibold text-[#71767B] uppercase mb-1">
                                    AI Profile Analysis
                                  </h5>
                                  <p className="text-[12px] text-[#E7E9EA] whitespace-pre-wrap line-clamp-4">
                                    {app.profileSummary}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#71767B]">
                                <span>Applied {formatTimeAgo(app.appliedAt)}</span>
                                <span>·</span>
                                <span className={getStatusColor(app.status)}>{app.status}</span>
                              </div>
                            </div>

                            <Button
                              variant="primary"
                              onClick={() => handleAssign(app.applicantId)}
                              className="flex-shrink-0"
                            >
                              Assign
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* xAI Option */}
                  {isAdmin && (
                    <div className="mt-6 p-4 border border-dashed border-[#2F3336] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-[14px] font-semibold text-[#E7E9EA] mb-1">
                            🤖 Assign to xAI Agent
                          </h4>
                          <p className="text-[12px] text-[#71767B]">
                            Let AI handle this task automatically
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => handleAssign('xai')}
                        >
                          Assign to xAI
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Close Job Button */}
                  <div className="mt-6 pt-4 border-t border-[#2F3336]">
                    <Button variant="secondary" onClick={handleCloseJob} className="w-full">
                      Close Job
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-[#2F3336] rounded-xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#16181C] mb-4">
                  <svg viewBox="0 0 24 24" fill="#71767B" className="w-8 h-8">
                    <path d="M19.5 6h-3V4.5C16.5 3.119 15.381 2 14 2h-4C8.619 2 7.5 3.119 7.5 4.5V6h-3C3.119 6 2 7.119 2 8.5v11C2 20.881 3.119 22 4.5 22h15c1.381 0 2.5-1.119 2.5-2.5v-11C22 7.119 20.881 6 19.5 6zM9.5 4.5c0-.276.224-.5.5-.5h4c.276 0 .5.224.5.5V6h-5V4.5zm10.5 15c0 .276-.224.5-.5.5h-15c-.276 0-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5h15c.276 0 .5.224.5.5v11z" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#E7E9EA] mb-2">
                  Select a Job
                </h3>
                <p className="text-[14px] text-[#71767B]">
                  Click on a job from the list to view its applications and AI suggestions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
