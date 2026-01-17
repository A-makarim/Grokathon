'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useApplications } from '@/contexts/ApplicationsContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { formatTimeAgo } from '@/lib/utils';
import type { Bounty, Application, Suggestion } from '@/lib/types';

interface ProfileModalData {
  name: string;
  handle: string;
  summary: string;
}

interface OwnerSubmissionsListProps {
  bounty: Bounty;
  /** AI suggestion for this bounty */
  suggestion?: Suggestion | null;
  /** Callback when user wants to assign to an applicant */
  onAssign?: (applicantId: string) => void;
  /** Callback to generate AI suggestion */
  onGenerateSuggestion?: () => void;
  /** Whether suggestion is being generated */
  isGeneratingSuggestion?: boolean;
  /** Slot for future action buttons per submission */
  renderActions?: (application: Application) => React.ReactNode;
  /** Slot for future header actions (bulk actions, filters, etc.) */
  renderHeaderActions?: () => React.ReactNode;
}

export function OwnerSubmissionsList({
  bounty,
  suggestion,
  onAssign,
  onGenerateSuggestion,
  isGeneratingSuggestion,
  renderActions,
  renderHeaderActions,
}: OwnerSubmissionsListProps) {
  const { getApplicationsForBounty, fetchApplicationsForJob, loadingByJob } = useApplications();
  const applications = getApplicationsForBounty(bounty.id);
  const isLoading = loadingByJob[bounty.id] || false;

  // Profile modal state
  const [profileModal, setProfileModal] = useState<ProfileModalData | null>(null);

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
        portfolioUrl: undefined,
      };
    }
    return {
      name: applicant.name || 'Unknown',
      handle: ('twitterHandle' in applicant ? applicant.twitterHandle : undefined) || 'applicant',
      avatar: ('avatar' in applicant ? applicant.avatar : undefined) || ('avatarUrl' in applicant ? applicant.avatarUrl : undefined),
      portfolioUrl: ('portfolioUrl' in applicant ? applicant.portfolioUrl : undefined),
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
          <div className="flex items-center gap-3">
            {onGenerateSuggestion && applications.length > 0 && !suggestion && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onGenerateSuggestion}
                disabled={isGeneratingSuggestion}
              >
                {isGeneratingSuggestion ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#1D9BF0] border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <>🤖 Get AI Suggestion</>
                )}
              </Button>
            )}
            {renderHeaderActions?.()}
          </div>
        </div>
        <p className="text-[13px] text-[#71767B]">
          Review applications for your bounty
        </p>

        {/* Stats Row */}
        {stats && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="px-3 py-1.5 bg-[#71767B]/10 border border-[#71767B]/30 rounded-lg">
              <span className="text-[11px] text-[#71767B] uppercase tracking-wide">To Review</span>
              <span className="ml-2 text-[14px] font-semibold text-[#E7E9EA]">{stats.pending}</span>
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
            const isAIPick = suggestion?.suggestedApplicantId === application.applicantId;
            
            return (
              <div
                key={application.id}
                className={`p-6 hover:bg-[#16181C]/50 transition-colors border-b border-[#2F3336] ${
                  isAIPick ? 'border-l-2 border-l-[#00BA7C] bg-[#00BA7C]/5' : ''
                }`}
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
                        {isAIPick && (
                          <Badge variant="success">AI Pick</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-[#71767B]">
                        <span>@{applicantInfo.handle}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(new Date(application.appliedAt))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Assign Button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {status !== 'pending' && (
                      <div
                        className={`px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {status}
                      </div>
                    )}
                    {onAssign && status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAssign(application.applicantId)}
                      >
                        Assign
                      </Button>
                    )}
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

                {/* Portfolio Link */}
                {applicantInfo.portfolioUrl && (
                  <div className="mb-4">
                    <a
                      href={applicantInfo.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-[#1D9BF0] hover:underline"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                      View Portfolio
                    </a>
                  </div>
                )}

                {/* Profile Summary - View Link */}
                {application.profileSummary && (
                  <div className="mb-4">
                    <button
                      onClick={() => setProfileModal({
                        name: applicantInfo.name,
                        handle: applicantInfo.handle || 'applicant',
                        summary: application.profileSummary!,
                      })}
                      className="inline-flex items-center gap-1.5 text-[13px] text-[#1D9BF0] hover:underline"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      View AI Profile
                    </button>
                  </div>
                )}

                {/* Action Buttons Slot */}
                {renderActions && (
                  <div className="flex items-center gap-3">
                    {renderActions(application)}
                  </div>
                )}
              </div>
            );
          })}

          {/* xAI Agent Option */}
          {onAssign && (
            <div className="p-6 border-b border-[#2F3336] border-dashed hover:bg-[#16181C]/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1D9BF0]/10 flex items-center justify-center">
                    <span className="text-[18px]">🤖</span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#E7E9EA]">
                      Assign to xAI Agent
                    </h4>
                    <p className="text-[13px] text-[#71767B]">
                      Let AI handle this task automatically
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAssign('xai')}
                >
                  Assign to xAI
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Summary Modal */}
      <Modal
        isOpen={!!profileModal}
        onClose={() => setProfileModal(null)}
        size="md"
      >
        <ModalHeader onClose={() => setProfileModal(null)}>
          <div className="flex items-center gap-2">
            <span>🤖</span>
            <span>AI Profile Analysis</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {profileModal && (
            <div className="space-y-6">
              {/* Applicant info header */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#2F3336]">
                <div className="w-12 h-12 rounded-full bg-[#1D9BF0]/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1D9BF0" strokeWidth="2" className="w-6 h-6">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#E7E9EA]">
                    {profileModal.name}
                  </h3>
                  <p className="text-[14px] text-[#71767B]">
                    @{profileModal.handle}
                  </p>
                </div>
              </div>

              {/* Profile summary content with nice typography */}
              <div className="prose-container">
                <div 
                  className="text-[15px] text-[#E7E9EA] leading-[1.8] space-y-4"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {profileModal.summary.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-[15px] text-[#E7E9EA]/90 leading-[1.8]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Footer note */}
              <div className="pt-4 border-t border-[#2F3336]">
                <p className="text-[12px] text-[#71767B] italic">
                  This profile analysis was generated by AI based on public information.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}
