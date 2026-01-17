'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { BountyFeed } from '@/components/bounties/BountyFeed';
import { useBounties } from '@/contexts/BountiesContext';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const { bounties, isLoading, error, refreshBounties } = useBounties();
  const { isAuthenticated } = useUser();

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#E7E9EA] mb-2">
          Open Bounties
        </h1>
        <p className="text-[15px] text-[#71767B]">
          Browse available jobs and apply to work on them
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 border border-[#F4212E] bg-[#F4212E]/10 rounded-xl">
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
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#1D9BF0] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#71767B]">Loading bounties...</p>
        </div>
      ) : bounties.length === 0 ? (
        <div className="py-16 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="#71767B"
            className="w-16 h-16 mx-auto mb-4"
          >
            <path d="M19.5 6h-3V4.5C16.5 3.119 15.381 2 14 2h-4C8.619 2 7.5 3.119 7.5 4.5V6h-3C3.119 6 2 7.119 2 8.5v11C2 20.881 3.119 22 4.5 22h15c1.381 0 2.5-1.119 2.5-2.5v-11C22 7.119 20.881 6 19.5 6zM9.5 4.5c0-.276.224-.5.5-.5h4c.276 0 .5.224.5.5V6h-5V4.5zm10.5 15c0 .276-.224.5-.5.5h-15c-.276 0-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5h15c.276 0 .5.224.5.5v11z" />
          </svg>
          <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-2">
            No open bounties yet
          </h3>
          <p className="text-[15px] text-[#71767B]">
            Check back soon for new opportunities, or connect your account to be notified.
          </p>
        </div>
      ) : (
        <BountyFeed bounties={bounties} />
      )}
    </MainLayout>
  );
}
