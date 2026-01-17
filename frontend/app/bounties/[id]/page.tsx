'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { BountyStatusBadge } from '@/components/bounties/BountyStatusBadge';
import { ApplicationForm } from '@/components/bounties/ApplicationForm';
import { BidList } from '@/components/bounties/BidList';
import { useBounties } from '@/contexts/BountiesContext';
import { useApplications } from '@/contexts/ApplicationsContext';
import { getCurrentUser } from '@/lib/mockData';
import { formatTimeAgo, formatReward, formatNumber } from '@/lib/utils';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BountyDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { bounties } = useBounties();
  const { getUserApplicationForBounty } = useApplications();
  const currentUser = getCurrentUser();
  const [showSuccess, setShowSuccess] = useState(false);

  // Find the bounty
  const bounty = bounties.find((b) => b.id === id);

  // Check if user already applied
  const existingApplication = bounty
    ? getUserApplicationForBounty(id, currentUser.id)
    : undefined;

  const handleApplicationSuccess = () => {
    setShowSuccess(true);
    // Auto-hide success message after 10 seconds
    setTimeout(() => setShowSuccess(false), 10000);
  };

  // 404 - Bounty not found
  if (!bounty) {
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
                Your bid has been submitted. You'll be notified when the poster responds.
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
          {/* Poster Info */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar
              src={bounty.poster.avatar}
              alt={bounty.poster.displayName}
              size="md"
              verified={bounty.poster.verified}
            />
            <div className="flex items-center gap-2 text-[15px]">
              <span className="font-bold text-[#E7E9EA]">
                {bounty.poster.displayName}
              </span>
              <span className="text-[#71767B]">{bounty.poster.username}</span>
              <span className="text-[#71767B]">·</span>
              <span className="text-[#71767B]">{formatTimeAgo(bounty.postedAt)}</span>
            </div>
          </div>

          {/* Bounty Title with Status Badge */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-[32px] font-bold text-[#E7E9EA] leading-tight flex-1">
              {bounty.title}
            </h1>
            <BountyStatusBadge status={bounty.status} />
          </div>

          {/* Budget & Metadata */}
          <div className="space-y-3 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-[14px] text-[#71767B] font-medium">Budget:</span>
              <span className="text-[16px] text-[#71767B]">Up to</span>
              <span className="text-[28px] font-bold text-[#1D9BF0]">
                {formatReward(bounty.reward, bounty.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#71767B] font-medium">Category:</span>
              <Badge variant="default">{bounty.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-[14px] text-[#71767B]">
              <span>{bounty.applicantCount} applicants</span>
              <span>·</span>
              <span>{formatNumber(bounty.viewCount)} views</span>
              <span>·</span>
              <span>{formatNumber(bounty.bookmarkCount)} bookmarks</span>
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

          {/* Tags */}
          {bounty.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {bounty.tags.map((tag, index) => (
                  <Badge key={index} variant="primary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Optional Details */}
          {(bounty.applicationDeadline || bounty.maxApplicants) && (
            <>
              <div className="border-t border-[#2F3336] my-6" />
              <div className="flex gap-6 text-[14px]">
                {bounty.applicationDeadline && (
                  <div>
                    <span className="text-[#71767B]">Deadline: </span>
                    <span className="text-[#E7E9EA]">
                      {bounty.applicationDeadline.toLocaleDateString()}
                    </span>
                  </div>
                )}
                {bounty.maxApplicants && (
                  <div>
                    <span className="text-[#71767B]">Max Applicants: </span>
                    <span className="text-[#E7E9EA]">{bounty.maxApplicants}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Two-Column Layout: Application Form + Bid List */}
        {bounty.status === 'open' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Application Form - 60% width on desktop */}
            <div className="lg:col-span-3">
              <ApplicationForm
                bounty={bounty}
                existingApplication={existingApplication}
                onSuccess={handleApplicationSuccess}
              />
            </div>

            {/* Bid List - 40% width on desktop */}
            <div className="lg:col-span-2">
              <BidList
                bountyId={bounty.id}
                maxBudget={bounty.reward}
                currency={bounty.currency}
              />
            </div>
          </div>
        )}

        {/* If bounty is not open, show bid list only */}
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
