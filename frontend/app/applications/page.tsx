'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';

type ApplicationStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('all');

  const tabs: { value: ApplicationStatus; label: string }[] = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#E7E9EA] mb-2">My Applications</h1>
          <p className="text-[15px] text-[#71767B]">
            Track all your bounty applications in one place
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#2F3336] mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'pb-3 text-[15px] font-medium transition-colors relative',
                  activeTab === tab.value
                    ? 'text-[#E7E9EA]'
                    : 'text-[#71767B] hover:text-[#E7E9EA]'
                )}
              >
                {tab.label}
                {activeTab === tab.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="py-16 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="#71767B"
            className="w-16 h-16 mx-auto mb-4"
          >
            <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v3.5h-17V4.25c0-.413.337-.75.75-.75zm15.5 17h-15.5c-.413 0-.75-.337-.75-.75V9.5h17v10.25c0 .413-.337.75-.75.75z" />
            <path d="M8 11h8v2H8zm0 4h8v2H8z" />
          </svg>
          <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-2">
            No applications yet
          </h3>
          <p className="text-[15px] text-[#71767B] mb-4">
            {activeTab === 'all'
              ? "You haven't applied to any bounties yet. Start browsing open bounties to find opportunities."
              : `You don't have any ${activeTab} applications.`}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
