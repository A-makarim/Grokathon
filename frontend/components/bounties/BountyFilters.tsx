'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { BountyCategory, SortOption } from '@/lib/types';
import { BOUNTY_CATEGORIES } from '@/lib/constants';

interface BountyFiltersProps {
  selectedCategory?: BountyCategory;
  sortBy: SortOption;
  searchQuery: string;
  onCategoryChange: (category?: BountyCategory) => void;
  onSortChange: (sort: SortOption) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export function BountyFilters({
  selectedCategory,
  sortBy,
  searchQuery,
  onCategoryChange,
  onSortChange,
  onSearchChange,
  onClearFilters,
}: BountyFiltersProps) {
  const hasActiveFilters = selectedCategory || searchQuery;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'highest_reward', label: 'Highest Reward' },
  ];

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            viewBox="0 0 24 24"
            fill="#71767B"
            className="w-5 h-5"
          >
            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search bounties by title, description, or tags..."
          className="w-full bg-[#202327] text-[#E7E9EA] placeholder-[#71767B] border border-[#2F3336] rounded-full pl-12 pr-4 py-3 text-[15px] focus:outline-none focus:border-[#1D9BF0] focus:bg-[#16181C] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="#71767B"
              className="w-5 h-5 hover:fill-[#E7E9EA] transition-colors"
            >
              <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
            </svg>
          </button>
        )}
      </div>

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
