'use client';

import React, { useMemo } from 'react';
import { useApplications } from '@/contexts/ApplicationsContext';
import { formatReward } from '@/lib/utils';
import type { Currency } from '@/lib/types';

interface BidListProps {
  bountyId: string;
  maxBudget: number;
  currency: Currency;
}

export function BidList({ bountyId, maxBudget, currency }: BidListProps) {
  const { getApplicationsForBounty } = useApplications();
  const applications = getApplicationsForBounty(bountyId);

  // Sort bids by amount (highest first)
  const sortedBids = useMemo(() => {
    return [...applications].sort((a, b) => b.bidAmount - a.bidAmount);
  }, [applications]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (applications.length === 0) {
      return null;
    }

    const amounts = applications.map((app) => app.bidAmount);
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    return { average, min, max };
  }, [applications]);

  return (
    <div className="border border-[#2F3336] rounded-xl p-6 bg-gradient-to-br from-[#000000] to-[#0A0A0A]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-1">
          Current Bids ({applications.length})
        </h3>
        <p className="text-[13px] text-[#71767B]">
          Maximum budget: {formatReward(maxBudget, currency)}
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
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h4 className="text-[16px] font-semibold text-[#E7E9EA] mb-2">
            No bids yet
          </h4>
          <p className="text-[14px] text-[#71767B]">
            Be the first to apply for this bounty!
          </p>
        </div>
      ) : (
        <>
          {/* Bid List */}
          <div className="space-y-2 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
            {sortedBids.map((application, index) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#16181C] border border-[#2F3336] hover:border-[#1D9BF0]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] text-[13px] font-semibold">
                    #{index + 1}
                  </div>
                  <span className="text-[15px] font-semibold text-[#E7E9EA]">
                    {formatReward(application.bidAmount, application.bidCurrency)}
                  </span>
                </div>
                {application.bidAmount === maxBudget && (
                  <span className="px-2 py-1 text-[11px] font-semibold text-[#1D9BF0] bg-[#1D9BF0]/10 rounded">
                    MAX
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Statistics */}
          {stats && (
            <div className="pt-6 border-t border-[#2F3336]">
              <h4 className="text-[14px] font-semibold text-[#E7E9EA] mb-4">
                Bid Statistics
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#16181C] rounded-lg p-3 border border-[#2F3336]">
                  <div className="text-[11px] text-[#71767B] mb-1 uppercase tracking-wide">
                    Average
                  </div>
                  <div className="text-[16px] font-bold text-[#E7E9EA]">
                    {formatReward(Math.round(stats.average), currency)}
                  </div>
                </div>
                <div className="bg-[#16181C] rounded-lg p-3 border border-[#2F3336]">
                  <div className="text-[11px] text-[#71767B] mb-1 uppercase tracking-wide">
                    Lowest
                  </div>
                  <div className="text-[16px] font-bold text-[#E7E9EA]">
                    {formatReward(stats.min, currency)}
                  </div>
                </div>
                <div className="bg-[#16181C] rounded-lg p-3 border border-[#2F3336]">
                  <div className="text-[11px] text-[#71767B] mb-1 uppercase tracking-wide">
                    Highest
                  </div>
                  <div className="text-[16px] font-bold text-[#E7E9EA]">
                    {formatReward(stats.max, currency)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
