'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { BountyCategory, SortOption } from '@/lib/types';
import { BOUNTY_CATEGORIES } from '@/lib/constants';

interface BountyFiltersProps {
  selectedCategory?: BountyCategory;
  sortBy: SortOption;
  onCategoryChange: (category?: BountyCategory) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

export function BountyFilters({
  selectedCategory,
  sortBy,
  onCategoryChange,
  onSortChange,
  onClearFilters,
}: BountyFiltersProps) {
  const hasActiveFilters = selectedCategory;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'highest_reward', label: 'Highest Reward' },
  ];

  return (
    <div className="mb-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-[#E7E9EA]">Browse Open Bounties</h2>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#71767B]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-[#16181C] text-[#E7E9EA] border border-[#2F3336] rounded-lg px-3 py-1.5 text-[13px] font-medium hover:border-[#1D9BF0]/50 transition-colors cursor-pointer focus:outline-none focus:border-[#1D9BF0]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Category Filters */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#71767B] font-medium">Category:</span>
          <button
            onClick={() => onCategoryChange(undefined)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors',
              !selectedCategory
                ? 'bg-[#1D9BF0] text-white'
                : 'bg-[#16181C] text-[#E7E9EA] border border-[#2F3336] hover:bg-white/[0.03]'
            )}
          >
            All
          </button>
          {BOUNTY_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() =>
                onCategoryChange(selectedCategory === category ? undefined : category)
              }
              className={cn(
                'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-[#1D9BF0] text-white'
                  : 'bg-[#16181C] text-[#E7E9EA] border border-[#2F3336] hover:bg-white/[0.03]'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#1D9BF0] hover:bg-[#1D9BF0]/10 transition-colors ml-auto"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
