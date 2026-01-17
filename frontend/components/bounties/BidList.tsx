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

  // Group bids by amount
  const groupedBids = useMemo(() => {
    const groups: { [key: number]: number } = {};
    applications.forEach((app) => {
      groups[app.bidAmount] = (groups[app.bidAmount] || 0) + 1;
    });
    return groups;
  }, [applications]);

  // Get unique bid amounts sorted
  const uniqueBidAmounts = useMemo(() => {
    return [...new Set(applications.map((app) => app.bidAmount))].sort((a, b) => a - b);
  }, [applications]);

  // Find max count for Y-axis scaling
  const maxCount = useMemo(() => {
    return Math.max(...Object.values(groupedBids), 1);
  }, [groupedBids]);

  // Generate smooth curve path using catmull-rom spline
  const generateSmoothPath = useMemo(() => {
    if (uniqueBidAmounts.length === 0) return { linePath: '', areaPath: '' };

    const width = 300;
    const height = 120;
    const padding = { top: 10, right: 10, bottom: 30, left: 10 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Create data points with padding at start and end
    const points: { x: number; y: number; amount: number; count: number }[] = [];
    
    // Add start point at 0
    points.push({
      x: padding.left,
      y: height - padding.bottom,
      amount: 0,
      count: 0
    });

    // Add bid data points
    uniqueBidAmounts.forEach((amount) => {
      const count = groupedBids[amount];
      const x = padding.left + (amount / maxBudget) * graphWidth;
      const y = height - padding.bottom - (count / maxCount) * graphHeight;
      points.push({ x, y, amount, count });
    });

    // Add end point at max budget
    if (uniqueBidAmounts[uniqueBidAmounts.length - 1] !== maxBudget) {
      points.push({
        x: width - padding.right,
        y: height - padding.bottom,
        amount: maxBudget,
        count: 0
      });
    }

    // Generate smooth curve using bezier curves
    if (points.length < 2) return { linePath: '', areaPath: '' };

    let linePath = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Control points for smooth curve
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Create area path (line path + close to bottom)
    const areaPath = linePath + 
      ` L ${points[points.length - 1].x} ${height - padding.bottom}` +
      ` L ${points[0].x} ${height - padding.bottom} Z`;

    return { linePath, areaPath, points, width, height, padding, graphWidth, graphHeight };
  }, [uniqueBidAmounts, groupedBids, maxBudget, maxCount]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-1">
          Bid Distribution
        </h3>
        <p className="text-[13px] text-[#71767B]">
          {applications.length} bid{applications.length !== 1 ? 's' : ''} · Max budget: {formatReward(maxBudget, currency)}
        </p>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1D9BF0]/10 mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1D9BF0"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
          </div>
          <h4 className="text-[15px] font-semibold text-[#E7E9EA] mb-1">
            No bids yet
          </h4>
          <p className="text-[13px] text-[#71767B]">
            Be the first to apply!
          </p>
        </div>
      ) : (
        <>
          {/* Graph */}
          <div className="relative bg-[#0a0a0a] border border-[#2F3336] rounded-lg p-2 mb-4">
            <svg
              viewBox="0 0 300 120"
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id="bidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1D9BF0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1D9BF0" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1D9BF0" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#1D9BF0" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1D9BF0" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <g stroke="#2F3336" strokeWidth="0.5" strokeDasharray="2,2">
                <line x1="10" y1="30" x2="290" y2="30" />
                <line x1="10" y1="55" x2="290" y2="55" />
                <line x1="10" y1="80" x2="290" y2="80" />
              </g>

              {/* Area fill */}
              {generateSmoothPath.areaPath && (
                <path
                  d={generateSmoothPath.areaPath}
                  fill="url(#bidGradient)"
                />
              )}

              {/* Line */}
              {generateSmoothPath.linePath && (
                <path
                  d={generateSmoothPath.linePath}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {generateSmoothPath.points?.slice(1, -1).map((point, i) => (
                <g key={i}>
                  {/* Glow effect */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#1D9BF0"
                    opacity="0.3"
                  />
                  {/* Point */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#000"
                    stroke="#1D9BF0"
                    strokeWidth="2"
                  />
                  {/* Count label */}
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    fill="#E7E9EA"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {point.count}
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              <text x="10" y="108" fill="#71767B" fontSize="9">$0</text>
              <text x="290" y="108" fill="#71767B" fontSize="9" textAnchor="end">
                {formatReward(maxBudget, currency)}
              </text>

              {/* Average line */}
              {stats && (
                <g>
                  <line
                    x1={10 + (stats.average / maxBudget) * 280}
                    y1="10"
                    x2={10 + (stats.average / maxBudget) * 280}
                    y2="90"
                    stroke="#FFD400"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  <text
                    x={10 + (stats.average / maxBudget) * 280}
                    y="8"
                    textAnchor="middle"
                    fill="#FFD400"
                    fontSize="8"
                    fontWeight="500"
                  >
                    avg
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Statistics Summary */}
          {stats && (
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <div className="text-[16px] font-bold text-[#E7E9EA]">
                  {formatReward(stats.min, currency)}
                </div>
                <div className="text-[10px] text-[#71767B] uppercase tracking-wide">Low</div>
              </div>
              <div className="w-px h-6 bg-[#2F3336]" />
              <div className="flex-1">
                <div className="text-[16px] font-bold text-[#FFD400]">
                  {formatReward(Math.round(stats.average), currency)}
                </div>
                <div className="text-[10px] text-[#71767B] uppercase tracking-wide">Avg</div>
              </div>
              <div className="w-px h-6 bg-[#2F3336]" />
              <div className="flex-1">
                <div className="text-[16px] font-bold text-[#1D9BF0]">
                  {formatReward(stats.max, currency)}
                </div>
                <div className="text-[10px] text-[#71767B] uppercase tracking-wide">High</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
