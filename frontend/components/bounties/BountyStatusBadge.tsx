import React from 'react';
import type { BountyStatus } from '@/lib/types';

interface BountyStatusBadgeProps {
  status: BountyStatus;
  /** When true and status is pending/open, shows subtle text instead of a badge */
  isOwner?: boolean;
}

export function BountyStatusBadge({ status, isOwner }: BountyStatusBadgeProps) {
  // For owners viewing open/pending bounties, show subtle text instead of a badge
  if (isOwner && (status === 'open' || status === 'pending')) {
    return (
      <span className="text-[13px] text-[#71767B] italic">
        Awaiting assignment
      </span>
    );
  }

  // Open status - white background, monospace, pulsing green dot
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white text-black font-mono text-[13px] font-medium tracking-wide uppercase">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BA7C] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BA7C]" />
        </span>
        Open
      </span>
    );
  }

  // In Progress - white background, monospace, pulsing blue dot
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white text-black font-mono text-[13px] font-medium tracking-wide uppercase">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9BF0] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D9BF0]" />
        </span>
        In Progress
      </span>
    );
  }

  // Pending - white background, monospace, pulsing yellow dot
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white text-black font-mono text-[13px] font-medium tracking-wide uppercase">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD400] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD400]" />
        </span>
        Pending
      </span>
    );
  }

  // Completed - muted style
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#2F3336] text-[#71767B] font-mono text-[13px] font-medium tracking-wide uppercase">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#71767B]" />
        </span>
        Completed
      </span>
    );
  }

  // Cancelled - muted red style
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#2F3336] text-[#F4212E] font-mono text-[13px] font-medium tracking-wide uppercase">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F4212E]" />
        </span>
        Cancelled
      </span>
    );
  }

  return null;
}
