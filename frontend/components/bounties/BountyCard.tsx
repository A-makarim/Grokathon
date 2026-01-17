'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
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
      className="group relative p-6 cursor-pointer hover:bg-[#0A0A0A] transition-colors duration-200"
      onClick={handleClick}
    >
      {/* Corner squares on hover - x.ai style */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute top-2 right-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Header: User Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            src={bounty.poster.avatar}
            alt={bounty.poster.displayName}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-medium text-[#E7E9EA] truncate">
                {bounty.poster.displayName}
              </span>
              {bounty.poster.verified && (
                <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-3.5 h-3.5 flex-shrink-0">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                </svg>
              )}
              <span className="text-[13px] text-[#71767B]">
                {bounty.poster.username}
              </span>
              <span className="text-[13px] text-[#71767B]">·</span>
              <span className="text-[13px] text-[#71767B]">
                {formatTimeAgo(bounty.postedAt)}
              </span>
            </div>
          </div>
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
        {/* Reward */}
        <div className="flex items-baseline gap-1">
          <span className="text-[12px] text-[#71767B]">Up to</span>
          <span className="text-[18px] font-bold text-[#E7E9EA]">
            {formatReward(bounty.reward, bounty.currency)}
          </span>
        </div>

        {/* Applicants */}
        <span className="text-[12px] text-[#71767B]">
          {bounty.applicantCount} {bounty.applicantCount === 1 ? 'bid' : 'bids'}
        </span>
      </div>
    </article>
  );
}
