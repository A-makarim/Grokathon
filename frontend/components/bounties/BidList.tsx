'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApplications } from '@/contexts/ApplicationsContext';
import { formatReward } from '@/lib/utils';
import type { Currency } from '@/lib/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

interface BidListProps {
  bountyId: string;
  maxBudget: number;
  currency: Currency;
}

export function BidList({ bountyId, maxBudget, currency }: BidListProps) {
  const { getApplicationsForBounty } = useApplications();
  const applications = getApplicationsForBounty(bountyId);

  // Create distribution data for chart
  const chartData = useMemo(() => {
    const bucketCount = 20;
    const bucketSize = maxBudget / bucketCount;
    const buckets: number[] = new Array(bucketCount + 1).fill(0);

    applications.forEach((app) => {
      const bucketIndex = Math.min(
        Math.floor(app.bidAmount / bucketSize),
        bucketCount
      );
      buckets[bucketIndex]++;
    });

    return {
      labels: buckets.map((_, i) => i),
      datasets: [
        {
          data: buckets,
          fill: true,
          backgroundColor: 'rgba(29, 155, 240, 0.1)',
          borderColor: '#1D9BF0',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };
  }, [applications, maxBudget]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }), []);

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-[18px] font-bold text-[#E7E9EA]">
          Bids ({applications.length})
        </h3>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-[#71767B]">
            No bids yet
          </p>
        </div>
      ) : (
        <div>
          {/* Chart */}
          <div className="relative h-[60px]">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {/* Price labels */}
          <div className="flex justify-between text-[12px] text-[#71767B] mt-1">
            <span>$0</span>
            <span>{formatReward(maxBudget, currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
