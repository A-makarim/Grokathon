'use client';

import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { formatReward } from '@/lib/utils';
import type { Application, Currency } from '@/lib/types';

interface BidChartProps {
  bountyId: string;
  maxBudget: number;
  currency: Currency;
}

export function BidChart({ bountyId, maxBudget, currency }: BidChartProps) {
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

  // Calculate bid statistics and histogram data
  const { stats, histogram, bids } = useMemo(() => {
    const validBids = applications
      .map((app: any) => app.bidAmount || 0)
      .filter((bid: number) => bid > 0)
      .sort((a: number, b: number) => a - b);

    if (validBids.length === 0) {
      return { stats: null, histogram: [], bids: [] };
    }

    const min = Math.min(...validBids);
    const max = Math.max(...validBids);
    const avg = validBids.reduce((sum: number, bid: number) => sum + bid, 0) / validBids.length;
    const median = validBids.length % 2 === 0
      ? (validBids[validBids.length / 2 - 1] + validBids[validBids.length / 2]) / 2
      : validBids[Math.floor(validBids.length / 2)];

    // Create histogram buckets (5 buckets)
    const bucketCount = 5;
    const range = max - min || 1;
    const bucketSize = range / bucketCount;
    
    const buckets: { min: number; max: number; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const bucketMin = min + (i * bucketSize);
      const bucketMax = min + ((i + 1) * bucketSize);
      buckets.push({
        min: bucketMin,
        max: bucketMax,
        count: validBids.filter((bid: number) => 
          i === bucketCount - 1 
            ? bid >= bucketMin && bid <= bucketMax
            : bid >= bucketMin && bid < bucketMax
        ).length,
      });
    }

    const maxCount = Math.max(...buckets.map(b => b.count), 1);

    return {
      stats: { min, max, avg, median, total: validBids.length },
      histogram: buckets.map(b => ({ ...b, percentage: (b.count / maxCount) * 100 })),
      bids: validBids,
    };
  }, [applications]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-[#16181C] rounded w-1/2 mb-4" />
        <div className="h-40 bg-[#16181C] rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-[#16181C] rounded w-3/4" />
          <div className="h-4 bg-[#16181C] rounded w-2/3" />
        </div>
      </div>
    );
  }

  // Count valid bids (bids with amount > 0)
  const validBidCount = bids.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wider text-[#71767B] mb-2 font-medium">Bid Distribution</div>
        <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-1">
          {validBidCount} {validBidCount === 1 ? 'Bid' : 'Bids'}
        </h3>
        <p className="text-[13px] text-[#71767B]">
          {validBidCount > 0 ? 'See how bids are distributed' : 'No bids have been placed yet'}
        </p>
      </div>

      {/* Empty State */}
      {!stats ? (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1D9BF0]/10 mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1D9BF0"
              strokeWidth="2"
              className="w-8 h-8"
            >
              <path d="M12 2v20M2 12h20" />
              <path d="M4 8h4v8H4zM10 6h4v10h-4zM16 10h4v6h-4z" />
            </svg>
          </div>
          <h4 className="text-[16px] font-semibold text-[#E7E9EA] mb-2">
            No bids yet
          </h4>
          <p className="text-[14px] text-[#71767B]">
            Be the first to place a bid!
          </p>
        </div>
      ) : (
        <>
          {/* Histogram Chart */}
          <div className="mb-6">
            <div className="flex items-end gap-1 h-32">
              {histogram.map((bucket, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-[#1D9BF0] rounded-t transition-all duration-300 hover:bg-[#1A8CD8]"
                    style={{ 
                      height: `${Math.max(bucket.percentage, 4)}%`,
                      minHeight: bucket.count > 0 ? '8px' : '2px',
                      opacity: bucket.count > 0 ? 1 : 0.3,
                    }}
                    title={`${bucket.count} bids between ${formatReward(bucket.min, currency)} - ${formatReward(bucket.max, currency)}`}
                  />
                </div>
              ))}
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-[10px] text-[#71767B]">
              <span>{formatReward(stats.min, currency)}</span>
              <span>{formatReward(stats.max, currency)}</span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-[#71767B] mb-1">Lowest Bid</div>
              <div className="text-[18px] font-bold text-[#00BA7C]">
                {formatReward(stats.min, currency)}
              </div>
            </div>
            <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-[#71767B] mb-1">Highest Bid</div>
              <div className="text-[18px] font-bold text-[#F4212E]">
                {formatReward(stats.max, currency)}
              </div>
            </div>
            <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-[#71767B] mb-1">Average Bid</div>
              <div className="text-[18px] font-bold text-[#1D9BF0]">
                {formatReward(Math.round(stats.avg), currency)}
              </div>
            </div>
            <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-[#71767B] mb-1">Median Bid</div>
              <div className="text-[18px] font-bold text-[#FFD400]">
                {formatReward(Math.round(stats.median), currency)}
              </div>
            </div>
          </div>

          {/* Budget Comparison */}
          {maxBudget > 0 && (
            <div className="mt-4 p-3 bg-[#16181C] border border-[#2F3336] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#71767B]">Budget utilization</span>
                <span className="text-[12px] text-[#E7E9EA] font-medium">
                  {Math.round((stats.avg / maxBudget) * 100)}% of max
                </span>
              </div>
              <div className="w-full h-2 bg-[#2F3336] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00BA7C] via-[#1D9BF0] to-[#F4212E] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.avg / maxBudget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[#71767B]">
                <span>$0</span>
                <span>{formatReward(maxBudget, currency)}</span>
              </div>
            </div>
          )}

          {/* Bid Count */}
          <div className="mt-4 text-center">
            <span className="text-[13px] text-[#71767B]">
              {stats.total} {stats.total === 1 ? 'person has' : 'people have'} bid on this bounty
            </span>
          </div>
        </>
      )}
    </div>
  );
}
