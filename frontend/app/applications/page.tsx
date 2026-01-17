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

type ApplicationStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'reviewed';

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: userLoading } = useUser();
  const { refreshMyApplications } = useApplications();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('all');

  const tabs: { value: ApplicationStatus; label: string }[] = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

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

  // Filter applications based on active tab
  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status?.toLowerCase() === activeTab;
  });

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
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#E7E9EA] mb-2">My Applications</h1>
          <p className="text-[15px] text-[#71767B]">
            Track all your bounty applications in one place
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#2F3336] mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'pb-3 text-[15px] font-medium transition-colors relative',
                  activeTab === tab.value
                    ? 'text-[#E7E9EA]'
                    : 'text-[#71767B] hover:text-[#E7E9EA]'
                )}
              >
                {tab.label}
                {activeTab === tab.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 border border-[#F4212E] bg-[#F4212E]/10 rounded-xl">
            <p className="text-[#F4212E] text-[14px]">{error}</p>
          </div>
        )}

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="py-16 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="#71767B"
              className="w-16 h-16 mx-auto mb-4"
            >
              <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v3.5h-17V4.25c0-.413.337-.75.75-.75zm15.5 17h-15.5c-.413 0-.75-.337-.75-.75V9.5h17v10.25c0 .413-.337.75-.75.75z" />
              <path d="M8 11h8v2H8zm0 4h8v2H8z" />
            </svg>
            <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-2">
              No applications yet
            </h3>
            <p className="text-[15px] text-[#71767B] mb-4">
              {activeTab === 'all'
                ? "You haven't applied to any bounties yet. Start browsing open bounties to find opportunities."
                : `You don't have any ${activeTab} applications.`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-bold text-[15px] rounded-full transition-all"
              >
                Browse Bounties
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
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
