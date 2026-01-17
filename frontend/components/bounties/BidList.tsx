'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils';
import type { Application, Currency } from '@/lib/types';

interface BidListProps {
  bountyId: string;
  maxBudget: number;
  currency: Currency;
}

export function BidList({ bountyId, maxBudget, currency }: BidListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const { applications: apps } = await api.getApplicationsForJob(bountyId);
        setApplications(apps || []);
      } catch (err) {
        // Likely not authorized - that's okay
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchApplications();
  }, [bountyId]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-[#16181C] rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-[#16181C] rounded" />
          <div className="h-12 bg-[#16181C] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wider text-[#71767B] mb-2 font-medium">Applicants</div>
        <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-1">
          {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
        </h3>
        <p className="text-[13px] text-[#71767B]">
          People who applied for this bounty
        </p>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="py-12 text-center">
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
            No applications yet
          </h4>
          <p className="text-[14px] text-[#71767B]">
            Be the first to apply for this bounty!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {applications.map((application: any, index) => (
            <div
              key={application.id}
              className="p-4 rounded-lg bg-[#16181C] border border-[#2F3336]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1D9BF0]/10 flex items-center justify-center text-[#1D9BF0] text-[12px] font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold text-[#E7E9EA]">
                      {application.applicant?.name || 'Anonymous'}
                    </span>
                    {application.applicant?.twitterHandle && (
                      <span className="ml-2 text-[12px] text-[#1D9BF0]">
                        @{application.applicant.twitterHandle}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-[#71767B]">
                  {formatTimeAgo(application.appliedAt)}
                </span>
              </div>
              {application.coverLetter && (
                <p className="text-[13px] text-[#71767B] line-clamp-2">
                  {application.coverLetter}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
