'use client';

import React from 'react';
import { formatTimeAgo } from '@/lib/utils';
import type { Job, Application, Suggestion } from '@/lib/types';

interface JobWithApplications extends Job {
  applications: Application[];
  suggestion?: Suggestion;
}

interface JobCardProps {
  job: JobWithApplications;
  isSelected?: boolean;
  onClick?: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const getStatusIndicator = () => {
    switch (job.status) {
      case 'OPEN':
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'IN_PROGRESS':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      case 'COMPLETED':
        return <div className="w-2 h-2 rounded-full bg-emerald-500" />;
      case 'CANCELLED':
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
    }
  };

  return (
    <article
      className={`group relative p-6 cursor-pointer hover:bg-[#0A0A0A] transition-colors duration-200 ${
        isSelected ? 'bg-[#0A0A0A]' : ''
      }`}
      onClick={onClick}
    >
      {/* Corner squares on hover - x.ai style - positioned at grid intersections */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1D9BF0]" />
      )}

      {/* Header: Status and Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          <span className="text-[12px] text-[#71767B] capitalize">
            {job.status.replace('_', ' ').toLowerCase()}
          </span>
        </div>
        <span className="text-[12px] text-[#71767B]">
          {formatTimeAgo(job.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-semibold text-[#E7E9EA] leading-snug mb-2 line-clamp-2 group-hover:text-[#1D9BF0] transition-colors">
        {job.title}
      </h3>

      {/* Description */}
      <p className="text-[14px] text-[#71767B] leading-relaxed mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Applications Count */}
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="#71767B" className="w-4 h-4">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="text-[13px] text-[#71767B]">
            {job.applications.length} {job.applications.length === 1 ? 'application' : 'applications'}
          </span>
        </div>

        {/* AI Suggestion Badge */}
        {job.suggestion && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#00BA7C]/10 rounded-full">
            <span className="text-[11px]">🤖</span>
            <span className="text-[11px] text-[#00BA7C] font-medium">AI Ready</span>
          </div>
        )}
      </div>

      {/* Budget if available */}
      {job.budget && (
        <div className="mt-3 pt-3 border-t border-[#2F3336]">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-[#71767B]">Budget</span>
            <span className="text-[16px] font-bold text-[#E7E9EA]">
              ${job.budget.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
