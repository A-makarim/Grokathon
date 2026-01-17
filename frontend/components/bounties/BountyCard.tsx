'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatTimeAgo, formatReward } from '@/lib/utils';
import type { Bounty } from '@/lib/types';

interface BountyCardProps {
  bounty: Bounty;
}

export function BountyCard({ bounty }: BountyCardProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleClick = () => {
    router.push(`/bounties/${bounty.id}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <article
      className="group relative p-6 cursor-pointer hover:bg-[#0A0A0A] transition-colors duration-200 border border-[#2F3336] rounded-xl"
      onClick={handleClick}
    >
      {/* Corner squares on hover - x.ai style */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute top-2 right-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Header: Source info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[13px] text-[#71767B]">
          {bounty.sourceTweetUrl && !bounty.sourceTweetUrl.includes('/test/') && !bounty.sourceTweetUrl.includes('/example/') && (
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>From tweet</span>
            </div>
          )}
          <span>·</span>
          <span>{formatTimeAgo(bounty.postedAt)}</span>
        </div>

        {/* Bookmark icon */}
        <button
          onClick={handleBookmark}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition-colors"
          aria-label="Bookmark"
        >
          {isBookmarked ? (
            <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-4 h-4">
              <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#71767B" strokeWidth="2" className="w-4 h-4">
              <path d="M6.5 4h11c.276 0 .5.22.5.5v14.56l-6-4.29-6 4.29V4.5c0-.28.224-.5.5-.5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-semibold text-[#E7E9EA] leading-snug mb-2 line-clamp-2 group-hover:text-[#1D9BF0] transition-colors">
        {bounty.title}
      </h3>

      {/* Description */}
      <p className="text-[14px] text-[#71767B] leading-relaxed mb-4 line-clamp-2">
        {bounty.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Complexity & Reward */}
        <div className="flex items-center gap-3">
          {bounty.complexity && (
            <span className="px-2 py-0.5 text-[11px] font-medium bg-[#1D9BF0]/10 text-[#1D9BF0] rounded-full">
              {bounty.complexity}
            </span>
          )}
          {bounty.reward > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-[12px] text-[#71767B]">Up to</span>
              <span className="text-[16px] font-bold text-[#E7E9EA]">
                {formatReward(bounty.reward, bounty.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <span className="px-2 py-0.5 text-[11px] font-medium bg-[#00BA7C]/10 text-[#00BA7C] rounded-full">
          Open
        </span>
      </div>
    </article>
  );
}
