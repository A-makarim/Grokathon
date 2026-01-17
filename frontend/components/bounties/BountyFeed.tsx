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
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(12);

  // Filter and sort bounties
  const filteredAndSortedBounties = useMemo(() => {
    let filtered = bounties;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((bounty) => {
        const titleMatch = bounty.title.toLowerCase().includes(query);
        const descriptionMatch = bounty.description.toLowerCase().includes(query);
        const tagsMatch = bounty.tags.some((tag) => tag.toLowerCase().includes(query));
        const categoryMatch = bounty.category.toLowerCase().includes(query);
        return titleMatch || descriptionMatch || tagsMatch || categoryMatch;
      });
    }

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
  }, [bounties, selectedCategory, sortBy, searchQuery]);

  // Bounties to display (with pagination)
  const displayedBounties = filteredAndSortedBounties.slice(0, displayCount);
  const hasMore = displayCount < filteredAndSortedBounties.length;

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSearchQuery('');
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
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onSearchChange={setSearchQuery}
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
            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
          </svg>
          <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-2">
            {searchQuery ? `No results for "${searchQuery}"` : 'No bounties found'}
          </h3>
          <p className="text-[15px] text-[#71767B] mb-4">
            {searchQuery
              ? 'Try different keywords or remove some filters.'
              : 'Try adjusting your filters or check back later for new opportunities.'}
          </p>
          {(selectedCategory || searchQuery) && (
            <Button variant="primary" onClick={handleClearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
