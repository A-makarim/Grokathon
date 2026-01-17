'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { useUser } from '@/contexts/UserContext';
import { useApplications } from '@/contexts/ApplicationsContext';
import { cn, formatTimeAgo, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Application, Job } from '@/lib/types';

interface ApplicationWithJob extends Application {
  job?: Job;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: userLoading } = useUser();
  const { refreshMyApplications } = useApplications();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const { applications: apps } = await api.getMyApplications();
        
        // Fetch job details for each application
        const appsWithJobs = await Promise.all(
          apps.map(async (app: any) => {
            try {
              const job = await api.getJob(app.jobId);
              return { ...app, job };
            } catch {
              return app;
            }
          })
        );
        
        setApplications(appsWithJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!userLoading) {
      fetchApplications();
    }
  }, [isAuthenticated, userLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [userLoading, isAuthenticated, router]);

  if (userLoading || isLoading) {
    return (
      <MainLayout>
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#1D9BF0] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#71767B]">Loading applications...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#E7E9EA] mb-2">My Applications</h1>
          <p className="text-[15px] text-[#71767B]">
            Track the status of your bounty applications
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 border border-[#F4212E] bg-[#F4212E]/10 rounded-xl">
            <p className="text-[#F4212E] text-[14px]">{error}</p>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="border border-[#2F3336] rounded-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#16181C] mb-6">
              <svg viewBox="0 0 24 24" fill="#71767B" className="w-10 h-10">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#E7E9EA] mb-2">No applications yet</h2>
            <p className="text-[15px] text-[#71767B] mb-6">
              When you apply for bounties, they will appear here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-bold text-[15px] rounded-full transition-all"
            >
              Browse Bounties
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border border-[#2F3336] rounded-xl p-6 hover:border-[#1D9BF0]/40 transition-colors cursor-pointer"
                onClick={() => router.push(`/bounties/${app.jobId}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] font-bold text-[#E7E9EA] mb-2 line-clamp-1">
                      {app.job?.title || 'Loading...'}
                    </h3>
                    {app.job?.description && (
                      <p className="text-[14px] text-[#71767B] mb-3 line-clamp-2">
                        {app.job.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="text-[#71767B]">
                        Applied {formatTimeAgo(app.appliedAt as string)}
                      </span>
                      <span className="text-[#2F3336]">•</span>
                      <span className={cn('font-medium', getStatusColor(app.status as string))}>
                        {app.status}
                      </span>
                      {app.job?.budget && (
                        <>
                          <span className="text-[#2F3336]">•</span>
                          <span className="text-[#1D9BF0] font-semibold">
                            ${app.job.budget.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      app.status === 'ACCEPTED'
                        ? 'success'
                        : app.status === 'REJECTED'
                        ? 'error'
                        : app.status === 'REVIEWED'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>

                {app.coverLetter && (
                  <div className="mt-4 pt-4 border-t border-[#2F3336]">
                    <h4 className="text-[12px] font-semibold text-[#71767B] uppercase mb-2">
                      Your Message
                    </h4>
                    <p className="text-[14px] text-[#E7E9EA] line-clamp-2">{app.coverLetter}</p>
                  </div>
                )}

                {app.profileSummary && (
                  <div className="mt-4 pt-4 border-t border-[#2F3336]">
                    <h4 className="text-[12px] font-semibold text-[#71767B] uppercase mb-2">
                      AI Profile Analysis
                    </h4>
                    <p className="text-[13px] text-[#E7E9EA] line-clamp-3">{app.profileSummary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
