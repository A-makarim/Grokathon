'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatTimeAgo, getStatusColor, cn } from '@/lib/utils';
import type { Job, Application, Suggestion, Applicant } from '@/lib/types';

interface JobWithApplications extends Job {
  applications: Application[];
  suggestion?: Suggestion;
}

interface JobDetailModalProps {
  job: JobWithApplications | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateSuggestion: () => void;
  onAssign: (applicantId: string) => void;
  onCloseJob: () => void;
  isGeneratingSuggestion: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  currentUserTwitterHandle?: string;
}

// Extract Twitter handle from tweet URL (e.g., https://twitter.com/keerthanenr/status/123)
function extractTwitterHandle(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/);
  return match ? match[1].toLowerCase() : undefined;
}

export function JobDetailModal({
  job,
  isOpen,
  onClose,
  onGenerateSuggestion,
  onAssign,
  onCloseJob,
  isGeneratingSuggestion,
  isAdmin,
  currentUserId,
  currentUserTwitterHandle,
}: JobDetailModalProps) {
  if (!job) return null;

  // Check if current user is the job creator (by ID or Twitter handle from source tweet)
  const userHandle = currentUserTwitterHandle?.replace('@', '').toLowerCase();
  const tweetAuthor = extractTwitterHandle(job.sourceTweetUrl);
  const isJobCreator = currentUserId && (
    job.createdBy === currentUserId || 
    (userHandle && tweetAuthor && userHandle === tweetAuthor)
  );
  // User can manage this job if they're admin OR the job creator
  const canManageJob = isAdmin || isJobCreator;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#2F3336] bg-gradient-to-br from-[#000000] to-[#0A0A0A] sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  job.status === 'OPEN' && 'bg-green-500',
                  job.status === 'IN_PROGRESS' && 'bg-blue-500',
                  job.status === 'COMPLETED' && 'bg-emerald-500',
                  job.status === 'CANCELLED' && 'bg-red-500',
                  job.status === 'PENDING_APPROVAL' && 'bg-yellow-500'
                )} />
                <span className="text-[12px] text-[#71767B] capitalize">
                  {job.status.replace('_', ' ').toLowerCase()}
                </span>
                <span className="text-[12px] text-[#71767B]">·</span>
                <span className="text-[12px] text-[#71767B]">
                  {formatTimeAgo(job.createdAt)}
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-[#E7E9EA] leading-tight">
                {job.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/[0.03] transition-colors flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="#71767B" className="w-5 h-5">
                <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71A1 1 0 0 0 5.7 7.12L10.59 12l-4.88 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z" />
              </svg>
            </button>
          </div>

          {/* Source Tweet */}
          {job.sourceTweetUrl && (
            <a
              href={job.sourceTweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-[13px] text-[#1D9BF0] hover:underline"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              View Source Tweet
            </a>
          )}
        </div>

        {/* Description */}
        <div className="p-6 border-b border-[#2F3336]">
          <h3 className="text-[14px] font-bold text-[#71767B] uppercase tracking-wide mb-3">
            Description
          </h3>
          <p className="text-[15px] text-[#E7E9EA] leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>

          {job.requirements && (
            <div className="mt-4 p-4 bg-[#16181C] border border-[#2F3336] rounded-lg">
              <h4 className="text-[12px] font-bold text-[#71767B] uppercase tracking-wide mb-2">
                Requirements
              </h4>
              <p className="text-[14px] text-[#E7E9EA] whitespace-pre-wrap">
                {job.requirements}
              </p>
            </div>
          )}

          {job.budget && (
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-[13px] text-[#71767B]">Budget:</span>
              <span className="text-[20px] font-bold text-[#1D9BF0]">
                ${job.budget.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* AI Suggestion Section */}
        {(job.suggestion || isGeneratingSuggestion) && (
          <div className="p-6 border-b border-[#2F3336] bg-gradient-to-r from-[#00BA7C]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00BA7C]/20 flex items-center justify-center">
                {isGeneratingSuggestion && !job.suggestion ? (
                  <div className="w-5 h-5 border-2 border-[#00BA7C] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-[18px]">🤖</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isGeneratingSuggestion && !job.suggestion ? (
                  <>
                    <h4 className="text-[15px] font-bold text-[#00BA7C] mb-1">
                      Analyzing applicants...
                    </h4>
                    <p className="text-[13px] text-[#71767B]">
                      Reviewing profiles and generating recommendation. This may take 15-20 seconds.
                    </p>
                  </>
                ) : job.suggestion ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[15px] font-bold text-[#00BA7C]">
                        AI Recommendation
                      </h4>
                      {job.suggestion.confidenceScore && (
                        <span className="px-2 py-0.5 bg-[#00BA7C]/20 text-[#00BA7C] text-[11px] font-semibold rounded-full">
                          {job.suggestion.confidenceScore}% confidence
                        </span>
                      )}
                    </div>
                    {job.suggestion.suggestXai ? (
                      <p className="text-[14px] text-[#E7E9EA]">
                        <strong>Recommend: xAI Agent</strong> — This task is suitable for AI automation.
                      </p>
                    ) : job.suggestion.applicant ? (
                      <p className="text-[14px] text-[#E7E9EA]">
                        <strong>Recommend: @{job.suggestion.applicant.twitterHandle}</strong>
                      </p>
                    ) : (
                      <p className="text-[14px] text-[#E7E9EA]">No recommendation available</p>
                    )}
                    {job.suggestion.reasoning && (
                      <p className="text-[13px] text-[#71767B] mt-2 leading-relaxed">
                        {job.suggestion.reasoning}
                      </p>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Applications Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-[#E7E9EA]">
              Applications ({job.applications.length})
            </h3>
            {canManageJob && job.applications.length > 0 && !job.suggestion && (
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
          </div>

          {job.applications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#16181C] mb-4">
                <svg viewBox="0 0 24 24" fill="#71767B" className="w-7 h-7">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-[14px] text-[#71767B]">No applications yet</p>
              <p className="text-[12px] text-[#536471] mt-1">Applications will appear here when users apply</p>
            </div>
          ) : (
            <div className="space-y-4">
              {job.applications.map((app: any) => (
                <div
                  key={app.id}
                  className={cn(
                    'p-5 border border-[#2F3336] rounded-xl hover:border-[#3F4347] transition-colors',
                    job.suggestion?.suggestedApplicantId === app.applicantId && 'border-[#00BA7C] bg-[#00BA7C]/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[15px] font-bold text-[#E7E9EA]">
                          {app.applicant?.name || 'Anonymous'}
                        </span>
                        {app.applicant?.twitterHandle && (
                          <a
                            href={`https://x.com/${app.applicant.twitterHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-[#1D9BF0] hover:underline"
                          >
                            @{app.applicant.twitterHandle}
                          </a>
                        )}
                        {job.suggestion?.suggestedApplicantId === app.applicantId && (
                          <Badge variant="success">AI Pick</Badge>
                        )}
                      </div>

                      {app.coverLetter && (
                        <p className="text-[14px] text-[#71767B] leading-relaxed mb-3">
                          {app.coverLetter}
                        </p>
                      )}

                      {app.applicant?.portfolioUrl && (
                        <a
                          href={app.applicant.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13px] text-[#1D9BF0] hover:underline"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                          </svg>
                          View Portfolio
                        </a>
                      )}

                      {/* Profile Summary from Profile Agent */}
                      {app.profileSummary && (
                        <div className="mt-3 p-4 bg-[#16181C] rounded-lg border border-[#2F3336]">
                          <h5 className="text-[11px] font-bold text-[#71767B] uppercase tracking-wide mb-2">
                            AI Profile Analysis
                          </h5>
                          <p className="text-[13px] text-[#E7E9EA] leading-relaxed line-clamp-4">
                            {app.profileSummary}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3 text-[12px] text-[#71767B]">
                        <span>Applied {formatTimeAgo(app.appliedAt)}</span>
                        <span>·</span>
                        <span className={getStatusColor(app.status)}>{app.status}</span>
                      </div>
                    </div>

                    {canManageJob && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAssign(app.applicantId)}
                        className="flex-shrink-0"
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* xAI Option */}
          {canManageJob && (
            <div className="mt-6 p-5 border border-dashed border-[#2F3336] rounded-xl hover:border-[#3F4347] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[15px] font-bold text-[#E7E9EA] mb-1">
                    🤖 Assign to xAI Agent
                  </h4>
                  <p className="text-[13px] text-[#71767B]">
                    Let AI handle this task automatically
                  </p>
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

          {/* Close Job Button */}
          {canManageJob && job.status === 'OPEN' && (
            <div className="mt-6 pt-6 border-t border-[#2F3336]">
              <Button variant="ghost" onClick={onCloseJob} className="w-full text-[#F4212E] hover:bg-[#F4212E]/10">
                Close Job
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
