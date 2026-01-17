'use client';

import React from 'react';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/Button';
import type { Job, Application, Suggestion } from '@/lib/types';

interface JobWithApplications extends Job {
  applications: Application[];
  suggestion?: Suggestion;
}

interface JobGridProps {
  jobs: JobWithApplications[];
  selectedJobId?: string | null;
  onSelectJob?: (job: JobWithApplications) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function JobGrid({ jobs, selectedJobId, onSelectJob, hasMore, onLoadMore }: JobGridProps) {
  if (jobs.length === 0) {
    return (
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
        <p className="text-[15px] text-[#71767B]">
          No bounties match your current filters. Try adjusting them or check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid with hashtag-style divider lines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#2F3336]">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className="border-r border-b border-[#2F3336]"
          >
            <JobCard 
              job={job} 
              isSelected={selectedJobId === job.id}
              onClick={() => onSelectJob?.(job)}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center py-8 border-b border-[#2F3336]">
          <Button variant="ghost" onClick={onLoadMore}>
            Load more bounties
          </Button>
        </div>
      )}

      {/* End of Feed Message */}
      {!hasMore && jobs.length > 5 && (
        <div className="py-8 text-center border-b border-[#2F3336]">
          <p className="text-[14px] text-[#71767B]">
            You've seen all the bounties
          </p>
        </div>
      )}
    </div>
  );
}

// Loading skeleton for grid
export function JobGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#2F3336]">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="border-r border-b border-[#2F3336] p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#16181C] rounded-full animate-pulse" />
            <div className="h-3 bg-[#16181C] rounded w-16 animate-pulse" />
          </div>
          <div className="h-5 bg-[#16181C] rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-4 bg-[#16181C] rounded w-full mb-1 animate-pulse" />
          <div className="h-4 bg-[#16181C] rounded w-4/5 mb-4 animate-pulse" />
          <div className="flex justify-between">
            <div className="h-4 bg-[#16181C] rounded w-24 animate-pulse" />
            <div className="h-4 bg-[#16181C] rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
