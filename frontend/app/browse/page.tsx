'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { BountyFeed } from '@/components/bounties/BountyFeed';
import { BountyGridSkeleton } from '@/components/bounties/BountyGrid';
import { useBounties } from '@/contexts/BountiesContext';

export default function BrowseBounties() {
  const { bounties, isLoading, error, refreshBounties } = useBounties();

  return (
    <MainLayout>
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 border border-[#F4212E] bg-[#F4212E]/10 rounded-xl animate-fadeIn">
          <p className="text-[#F4212E] text-[14px]">{error}</p>
          <button
            onClick={refreshBounties}
            className="mt-2 text-[#1D9BF0] text-[14px] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && bounties.length === 0 ? (
        <div className="animate-fadeIn">
          <div className="mb-6">
            <div className="h-8 bg-[#16181C] rounded w-64 mb-4 animate-pulse" />
            <div className="h-12 bg-[#16181C] rounded-full w-full mb-4 animate-pulse" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-[#16181C] rounded-lg w-20 animate-pulse" />
              ))}
            </div>
          </div>
          <BountyGridSkeleton />
        </div>
      ) : (
        <BountyFeed bounties={bounties} />
      )}
    </MainLayout>
  );
}
