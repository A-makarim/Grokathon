'use client';

import React, { useMemo } from 'react';
import { useApplications } from '@/contexts/ApplicationsContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatReward, formatTimeAgo } from '@/lib/utils';
import type { Bounty, Application } from '@/lib/types';

interface OwnerSubmissionsListProps {
  bounty: Bounty;
  /** Slot for future action buttons per submission */
  renderActions?: (application: Application) => React.ReactNode;
  /** Slot for future header actions (bulk actions, filters, etc.) */
  renderHeaderActions?: () => React.ReactNode;
}

export function OwnerSubmissionsList({
  bounty,
  renderActions,
  renderHeaderActions,
}: OwnerSubmissionsListProps) {
  const { getApplicationsForBounty } = useApplications();
  const applications = getApplicationsForBounty(bounty.id);

  // Sort by most recent first
  const sortedApplications = useMemo(() => {
    return [...applications].sort(
      (a, b) => b.appliedAt.getTime() - a.appliedAt.getTime()
    );
  }, [applications]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (applications.length === 0) return null;

    const amounts = applications.map((app) => app.bidAmount);
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const pending = applications.filter((app) => app.status === 'pending').length;
    const accepted = applications.filter((app) => app.status === 'accepted').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;

    return { average, min, max, pending, accepted, rejected };
  }, [applications]);

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return 'text-[#00BA7C] bg-[#00BA7C]/10 border-[#00BA7C]/30';
      case 'rejected':
        return 'text-[#F4212E] bg-[#F4212E]/10 border-[#F4212E]/30';
      default:
        return 'text-[#FFD400] bg-[#FFD400]/10 border-[#FFD400]/30';
    }
  };

  return (
    <div className="border border-[#2F3336] rounded-xl bg-gradient-to-br from-[#000000] to-[#0A0A0A]">
      {/* Header */}
      <div className="p-6 border-b border-[#2F3336]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[20px] font-bold text-[#E7E9EA]">
            Submissions ({applications.length})
          </h3>
          {renderHeaderActions?.()}
        </div>
        <p className="text-[13px] text-[#71767B]">
          Review applications for your bounty
        </p>

        {/* Stats Row */}
        {stats && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="px-3 py-1.5 bg-[#16181C] border border-[#2F3336] rounded-lg">
              <span className="text-[11px] text-[#71767B] uppercase tracking-wide">Avg Bid</span>
              <span className="ml-2 text-[14px] font-semibold text-[#E7E9EA]">
                {formatReward(Math.round(stats.average), bounty.currency)}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-[#16181C] border border-[#2F3336] rounded-lg">
              <span className="text-[11px] text-[#71767B] uppercase tracking-wide">Range</span>
              <span className="ml-2 text-[14px] font-semibold text-[#E7E9EA]">
                {formatReward(stats.min, bounty.currency)} - {formatReward(stats.max, bounty.currency)}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-[#FFD400]/10 border border-[#FFD400]/30 rounded-lg">
              <span className="text-[11px] text-[#FFD400] uppercase tracking-wide">Pending</span>
              <span className="ml-2 text-[14px] font-semibold text-[#FFD400]">{stats.pending}</span>
            </div>
            {stats.accepted > 0 && (
              <div className="px-3 py-1.5 bg-[#00BA7C]/10 border border-[#00BA7C]/30 rounded-lg">
                <span className="text-[11px] text-[#00BA7C] uppercase tracking-wide">Accepted</span>
                <span className="ml-2 text-[14px] font-semibold text-[#00BA7C]">{stats.accepted}</span>
              </div>
            )}
            {stats.rejected > 0 && (
              <div className="px-3 py-1.5 bg-[#F4212E]/10 border border-[#F4212E]/30 rounded-lg">
                <span className="text-[11px] text-[#F4212E] uppercase tracking-wide">Rejected</span>
                <span className="ml-2 text-[14px] font-semibold text-[#F4212E]">{stats.rejected}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1D9BF0]/10 mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1D9BF0"
              strokeWidth="2"
              className="w-8 h-8"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h4 className="text-[16px] font-semibold text-[#E7E9EA] mb-2">
            No submissions yet
          </h4>
          <p className="text-[14px] text-[#71767B] max-w-sm mx-auto">
            Your bounty is live! Share it to get more visibility and attract talented applicants.
          </p>
        </div>
      ) : (
        /* Submissions List */
        <div className="divide-y divide-[#2F3336]">
          {sortedApplications.map((application) => (
            <div
              key={application.id}
              className="p-6 hover:bg-[#16181C]/50 transition-colors"
            >
              {/* Applicant Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={application.applicant.avatar}
                    alt={application.applicant.displayName}
                    size="md"
                    verified={application.applicant.verified}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-[#E7E9EA] truncate">
                        {application.applicant.displayName}
                      </span>
                      {application.applicant.verified && (
                        <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-4 h-4 flex-shrink-0">
                          <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#71767B]">
                      <span>{application.applicant.username}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(application.appliedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Bid Amount & Status */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[18px] font-bold text-[#1D9BF0]">
                      {formatReward(application.bidAmount, application.bidCurrency)}
                    </div>
                    {application.bidAmount === bounty.reward && (
                      <span className="text-[11px] text-[#71767B]">Max budget</span>
                    )}
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize border ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </div>
                </div>
              </div>

              {/* Application Message */}
              <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-4 mb-4">
                <p className="text-[14px] text-[#E7E9EA] leading-relaxed whitespace-pre-wrap">
                  {application.message}
                </p>
              </div>

              {/* Action Buttons Slot */}
              {renderActions && (
                <div className="flex items-center gap-3">
                  {renderActions(application)}
                </div>
              )}

              {/* Placeholder for future actions when no renderActions provided */}
              {!renderActions && application.status === 'pending' && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[13px] text-[#71767B] italic">
                    Review actions coming soon...
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
