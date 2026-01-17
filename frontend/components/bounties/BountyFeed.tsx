'use client';

import React, { useState, useMemo } from 'react';
import { BountyGrid } from './BountyGrid';
import { BountyFilters } from './BountyFilters';
import { Button } from '@/components/ui/Button';
import type { Bounty, BountyCategory, SortOption } from '@/lib/types';

interface BountyFeedProps {
  bounties: Bounty[];
}

export function BountyFeed({ bounties }: BountyFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<BountyCategory | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [displayCount, setDisplayCount] = useState(12);

  // Filter and sort bounties
  const filteredAndSortedBounties = useMemo(() => {
    let filtered = bounties;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((bounty) => bounty.category === selectedCategory);
    }

    // Sort bounties
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.postedAt.getTime() - a.postedAt.getTime();
        case 'popular':
          return b.viewCount + b.applicantCount - (a.viewCount + a.applicantCount);
        case 'highest_reward':
          return b.reward - a.reward;
        default:
          return 0;
      }
    });

    return sorted;
  }, [bounties, selectedCategory, sortBy]);

  // Bounties to display (with pagination)
  const displayedBounties = filteredAndSortedBounties.slice(0, displayCount);
  const hasMore = displayCount < filteredAndSortedBounties.length;

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredAndSortedBounties.length));
  };

  return (
    <div>
      {/* Filters */}
      <BountyFilters
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Bounty Grid */}
      {displayedBounties.length > 0 ? (
        <BountyGrid
          bounties={displayedBounties}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      ) : (
        // Empty State with Clear Filters Option
        <div className="py-16 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="#71767B"
            className="w-16 h-16 mx-auto mb-4"
          >
            <path d="M19.5 6h-3V4.5C16.5 3.119 15.381 2 14 2h-4C8.619 2 7.5 3.119 7.5 4.5V6h-3C3.119 6 2 7.119 2 8.5v11C2 20.881 3.119 22 4.5 22h15c1.381 0 2.5-1.119 2.5-2.5v-11C22 7.119 20.881 6 19.5 6zM9.5 4.5c0-.276.224-.5.5-.5h4c.276 0 .5.224.5.5V6h-5V4.5zm10.5 15c0 .276-.224.5-.5.5h-15c-.276 0-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5h15c.276 0 .5.224.5.5v11z" />
          </svg>
          <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-2">
            No bounties found
          </h3>
          <p className="text-[15px] text-[#71767B] mb-4">
            Try adjusting your filters or check back later for new opportunities.
          </p>
          {selectedCategory && (
            <Button variant="primary" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
