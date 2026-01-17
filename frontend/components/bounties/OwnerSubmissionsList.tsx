'use client';

import React, { useMemo, useEffect } from 'react';
import { useApplications } from '@/contexts/ApplicationsContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatTimeAgo } from '@/lib/utils';
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
  const { getApplicationsForBounty, fetchApplicationsForJob, loadingByJob } = useApplications();
  const applications = getApplicationsForBounty(bounty.id);
  const isLoading = loadingByJob[bounty.id] || false;

  // Fetch applications when component mounts
  useEffect(() => {
    fetchApplicationsForJob(bounty.id);
  }, [bounty.id, fetchApplicationsForJob]);

  // Sort by most recent first
  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const dateA = new Date(a.appliedAt).getTime();
      const dateB = new Date(b.appliedAt).getTime();
      return dateB - dateA;
    });
  }, [applications]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (applications.length === 0) return null;

    const normalizeStatus = (status: string) => status?.toLowerCase() || 'pending';
    const pending = applications.filter((app) => normalizeStatus(app.status) === 'pending').length;
    const accepted = applications.filter((app) => normalizeStatus(app.status) === 'accepted').length;
    const rejected = applications.filter((app) => normalizeStatus(app.status) === 'rejected').length;
    const reviewed = applications.filter((app) => normalizeStatus(app.status) === 'reviewed').length;

    return { pending, accepted, rejected, reviewed };
  }, [applications]);

  const getStatusColor = (status: Application['status']) => {
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : 'pending';
    switch (normalizedStatus) {
      case 'accepted':
        return 'text-[#00BA7C] bg-[#00BA7C]/10 border-[#00BA7C]/30';
      case 'rejected':
        return 'text-[#F4212E] bg-[#F4212E]/10 border-[#F4212E]/30';
      case 'reviewed':
        return 'text-[#1D9BF0] bg-[#1D9BF0]/10 border-[#1D9BF0]/30';
      default:
        return 'text-[#FFD400] bg-[#FFD400]/10 border-[#FFD400]/30';
    }
  };

  // Get applicant display info
  const getApplicantInfo = (application: Application) => {
    const applicant = application.applicant;
    if (!applicant) {
      return {
        name: 'Unknown Applicant',
        handle: 'unknown',
        avatar: undefined,
      };
    }
    return {
      name: applicant.name || 'Unknown',
      handle: ('twitterHandle' in applicant ? applicant.twitterHandle : undefined) || 'applicant',
      avatar: ('avatar' in applicant ? applicant.avatar : undefined) || ('avatarUrl' in applicant ? applicant.avatarUrl : undefined),
    };
  };

  return (
    <div className="border-t border-l border-[#2F3336]">
      {/* Header */}
      <div className="p-6 border-r border-b border-[#2F3336]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#71767B] mb-2 font-medium">Your Bounty</div>
            <h3 className="text-[20px] font-bold text-[#E7E9EA]">
              {applications.length} {applications.length === 1 ? 'Submission' : 'Submissions'}
            </h3>
          </div>
          {renderHeaderActions?.()}
        </div>
        <p className="text-[13px] text-[#71767B]">
          Review applications for your bounty
        </p>

        {/* Stats Row */}
        {stats && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="px-3 py-1.5 bg-[#FFD400]/10 border border-[#FFD400]/30 rounded-lg">
              <span className="text-[11px] text-[#FFD400] uppercase tracking-wide">Pending</span>
              <span className="ml-2 text-[14px] font-semibold text-[#FFD400]">{stats.pending}</span>
            </div>
            {stats.reviewed > 0 && (
              <div className="px-3 py-1.5 bg-[#1D9BF0]/10 border border-[#1D9BF0]/30 rounded-lg">
                <span className="text-[11px] text-[#1D9BF0] uppercase tracking-wide">Reviewed</span>
                <span className="ml-2 text-[14px] font-semibold text-[#1D9BF0]">{stats.reviewed}</span>
              </div>
            )}
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

      {/* Loading State */}
      {isLoading && applications.length === 0 && (
        <div className="p-12 text-center border-r border-b border-[#2F3336]">
          <div className="animate-spin w-8 h-8 border-2 border-[#1D9BF0] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[14px] text-[#71767B]">Loading applications...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && applications.length === 0 ? (
        <div className="p-12 text-center border-r border-b border-[#2F3336]">
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
        <div className="border-r border-[#2F3336]">
          {sortedApplications.map((application) => {
            const applicantInfo = getApplicantInfo(application);
            const status = typeof application.status === 'string' ? application.status.toLowerCase() : 'pending';
            
            return (
              <div
                key={application.id}
                className="p-6 hover:bg-[#16181C]/50 transition-colors border-b border-[#2F3336]"
              >
                {/* Applicant Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={applicantInfo.avatar}
                      alt={applicantInfo.name}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-[#E7E9EA] truncate">
                          {applicantInfo.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-[#71767B]">
                        <span>@{applicantInfo.handle}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(new Date(application.appliedAt))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className={`px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize border ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {status}
                    </div>
                  </div>
                </div>

                {/* Application Message / Cover Letter */}
                {(application.coverLetter || application.message) && (
                  <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-4 mb-4">
                    <p className="text-[14px] text-[#E7E9EA] leading-relaxed whitespace-pre-wrap">
                      {application.coverLetter || application.message}
                    </p>
                  </div>
                )}

                {/* Profile Summary (if available from Profile Agent) */}
                {application.profileSummary && (
                  <div className="bg-[#1D9BF0]/5 border border-[#1D9BF0]/20 rounded-lg p-4 mb-4">
                    <div className="text-[11px] text-[#1D9BF0] uppercase tracking-wide mb-2 font-medium">
                      AI Profile Summary
                    </div>
                    <p className="text-[14px] text-[#E7E9EA] leading-relaxed">
                      {application.profileSummary}
                    </p>
                  </div>
                )}

                {/* Action Buttons Slot */}
                {renderActions && (
                  <div className="flex items-center gap-3">
                    {renderActions(application)}
                  </div>
                )}

                {/* Placeholder for future actions when no renderActions provided */}
                {!renderActions && status === 'pending' && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-[13px] text-[#71767B] italic">
                      Review actions coming soon...
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
