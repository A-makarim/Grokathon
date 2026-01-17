'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { BountyGrid } from '@/components/bounties/BountyGrid';
import { useBounties } from '@/contexts/BountiesContext';

export default function BookmarksPage() {
  const { bounties, bookmarkedBountyIds } = useBounties();

  const bookmarkedBounties = bounties.filter((bounty) => bookmarkedBountyIds.has(bounty.id));

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#E7E9EA] mb-2">Bookmarked Bounties</h1>
          <p className="text-[15px] text-[#71767B]">
            {bookmarkedBounties.length} saved {bookmarkedBounties.length === 1 ? 'bounty' : 'bounties'}
          </p>
        </div>

        {/* Bounty Grid */}
        {bookmarkedBounties.length > 0 ? (
          <BountyGrid bounties={bookmarkedBounties} />
        ) : (
          <div className="py-16 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="#71767B"
              className="w-16 h-16 mx-auto mb-4"
            >
              <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
            </svg>
            <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-2">
              No bookmarked bounties yet
            </h3>
            <p className="text-[15px] text-[#71767B]">
              Start bookmarking bounties you're interested in to save them for later.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
