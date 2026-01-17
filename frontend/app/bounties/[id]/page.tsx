'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { BountyStatusBadge } from '@/components/bounties/BountyStatusBadge';
import { ApplicationForm } from '@/components/bounties/ApplicationForm';
import { BidList } from '@/components/bounties/BidList';
import { useBounties } from '@/contexts/BountiesContext';
import { useUser } from '@/contexts/UserContext';
import { formatTimeAgo, formatReward, formatNumber, jobStatusToBountyStatus } from '@/lib/utils';
import api from '@/lib/api';
import type { Job, Bounty, Application } from '@/lib/types';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BountyDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { jobs, refreshBounties } = useBounties();
  const { currentUser, isAuthenticated } = useUser();
  
  const [job, setJob] = useState<Job | null>(null);
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch job data
  useEffect(() => {
    async function fetchJob() {
      try {
        const jobData = await api.getJob(id);
        setJob(jobData);
        
        // Convert to bounty format
        setBounty({
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          category: 'development',
          reward: jobData.budget || 0,
          currency: 'USD',
          status: jobStatusToBountyStatus(jobData.status),
          poster: {
            id: jobData.createdBy || 'system',
            name: 'Job Creator',
            role: 'user',
            twitterHandle: '@xbounty',
            createdAt: jobData.createdAt,
          },
          postedAt: new Date(jobData.createdAt),
          tags: jobData.complexity ? [jobData.complexity.toLowerCase()] : [],
          applicantCount: 0,
          viewCount: 0,
          bookmarkCount: 0,
          requirements: jobData.requirements || undefined,
          complexity: jobData.complexity || undefined,
          sourceTweetUrl: jobData.sourceTweetUrl || undefined,
        });
      } catch (err) {
        console.error('Failed to fetch job:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  // Check for existing application
  useEffect(() => {
    async function checkApplication() {
      if (!isAuthenticated || !job) return;
      
      try {
        const { applications } = await api.getMyApplications();
        const existing = applications.find((app: any) => app.jobId === id);
        if (existing) {
          setExistingApplication({
            ...existing,
            bountyId: existing.jobId,
            message: existing.coverLetter || '',
            bidAmount: 0,
            bidCurrency: 'USD',
          });
        }
      } catch (err) {
        // Not authenticated or no applications
      }
    }
    checkApplication();
  }, [isAuthenticated, job, id]);

  const handleApplicationSuccess = () => {
    setShowSuccess(true);
    refreshBounties();
    setTimeout(() => setShowSuccess(false), 10000);
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#1D9BF0] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#71767B]">Loading bounty...</p>
        </div>
      </MainLayout>
    );
  }

  // 404 - Job not found
  if (!job || !bounty) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F4212E]/10 mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F4212E"
              strokeWidth="2"
              className="w-10 h-10"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-[#E7E9EA] mb-3">
            Bounty Not Found
          </h1>
          <p className="text-[15px] text-[#71767B] mb-8">
            The bounty you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-bold text-[15px] rounded-full transition-all"
          >
            Browse Bounties
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#1D9BF0] hover:text-[#1A8CD8] mb-6 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-[15px] font-semibold">Back</span>
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 border border-[#00BA7C] bg-[#00BA7C]/10 rounded-xl flex items-start gap-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00BA7C"
              strokeWidth="2"
              className="w-6 h-6 flex-shrink-0 mt-0.5"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <div className="flex-1">
              <h4 className="text-[16px] font-bold text-[#00BA7C] mb-1">
                Application Submitted Successfully!
              </h4>
              <p className="text-[14px] text-[#E7E9EA] mb-2">
                Your application has been submitted. The job creator will review your profile.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/applications')}
                  className="text-[13px] font-semibold text-[#1D9BF0] hover:underline"
                >
                  View My Applications
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="text-[13px] font-semibold text-[#1D9BF0] hover:underline"
                >
                  Browse More Bounties
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-shrink-0 text-[#71767B] hover:text-[#E7E9EA] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
              </svg>
            </button>
          </div>
        )}

        {/* Bounty Header */}
        <div className="border border-[#2F3336] rounded-xl p-8 mb-6 bg-gradient-to-br from-[#000000] to-[#0A0A0A]">
          {/* Source Tweet Link - only show if it's a real tweet URL */}
          {bounty.sourceTweetUrl && !bounty.sourceTweetUrl.includes('/test/') && !bounty.sourceTweetUrl.includes('/example/') && (
            <div className="mb-4">
              <a
                href={bounty.sourceTweetUrl.replace('twitter.com', 'x.com')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1D9BF0]/10 border border-[#1D9BF0]/20 rounded-full text-[13px] text-[#1D9BF0] hover:bg-[#1D9BF0]/20 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                View Source Tweet
              </a>
            </div>
          )}

          {/* Bounty Title with Status Badge */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-[32px] font-bold text-[#E7E9EA] leading-tight flex-1">
              {bounty.title}
            </h1>
            <BountyStatusBadge status={bounty.status} />
          </div>

          {/* Budget & Metadata */}
          <div className="space-y-3 mb-6">
            {bounty.reward > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] text-[#71767B] font-medium">Budget:</span>
                <span className="text-[16px] text-[#71767B]">Up to</span>
                <span className="text-[28px] font-bold text-[#1D9BF0]">
                  {formatReward(bounty.reward, bounty.currency)}
                </span>
              </div>
            )}
            {bounty.complexity && (
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#71767B] font-medium">Complexity:</span>
                <Badge variant="default">{bounty.complexity}</Badge>
              </div>
            )}
            <div className="flex items-center gap-2 text-[14px] text-[#71767B]">
              <span>Posted {formatTimeAgo(bounty.postedAt)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2F3336] my-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-[18px] font-bold text-[#E7E9EA] mb-3">
              Description
            </h2>
            <p className="text-[15px] text-[#E7E9EA] leading-7 whitespace-pre-wrap">
              {bounty.description}
            </p>
          </div>

          {/* Requirements */}
          {bounty.requirements && (
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-[#E7E9EA] mb-3">
                Requirements
              </h2>
              <p className="text-[15px] text-[#E7E9EA] leading-7 whitespace-pre-wrap">
                {bounty.requirements}
              </p>
            </div>
          )}

          {/* Tags */}
          {bounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bounty.tags.map((tag, index) => (
                <Badge key={index} variant="primary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Layout: Application Form + Applicant List */}
        {bounty.status === 'open' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Application Form - 60% width on desktop */}
            <div className="lg:col-span-3">
              <ApplicationForm
                bounty={bounty}
                existingApplication={existingApplication || undefined}
                onSuccess={handleApplicationSuccess}
              />
            </div>

            {/* Applicant List - 40% width on desktop */}
            <div className="lg:col-span-2">
              <BidList
                bountyId={bounty.id}
                maxBudget={bounty.reward}
                currency={bounty.currency}
              />
            </div>
          </div>
        )}

        {/* If bounty is not open, show applicant list only */}
        {bounty.status !== 'open' && (
          <div className="max-w-2xl">
            <BidList
              bountyId={bounty.id}
              maxBudget={bounty.reward}
              currency={bounty.currency}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
