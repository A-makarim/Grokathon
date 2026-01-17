'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { BountyGrid } from '@/components/bounties/BountyGrid';
import { useUser } from '@/contexts/UserContext';
import { useBounties } from '@/contexts/BountiesContext';
import { cn } from '@/lib/utils';

type DashboardTab = 'posted' | 'bookmarks';

export default function DashboardPage() {
  const { currentUser } = useUser();
  const { bounties, bookmarkedBountyIds } = useBounties();
  const [activeTab, setActiveTab] = useState<DashboardTab>('posted');

  // Filter bounties
  const myBounties = bounties.filter((bounty) => bounty.poster.id === currentUser.id);
  const bookmarkedBounties = bounties.filter((bounty) => bookmarkedBountyIds.has(bounty.id));
  const openBounties = myBounties.filter((bounty) => bounty.status === 'open');
  const completedBounties = myBounties.filter((bounty) => bounty.status === 'completed');

  // Calculate stats
  const totalSpent = completedBounties.reduce((sum, bounty) => sum + bounty.reward, 0);

  const displayedBounties = activeTab === 'posted' ? myBounties : bookmarkedBounties;

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#E7E9EA] mb-2">Dashboard</h1>
          <p className="text-[15px] text-[#71767B]">
            Track your bounties and performance metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">Total Posted</span>
              <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-5 h-5">
                <path d="M19.5 6h-3V4.5C16.5 3.119 15.381 2 14 2h-4C8.619 2 7.5 3.119 7.5 4.5V6h-3C3.119 6 2 7.119 2 8.5v11C2 20.881 3.119 22 4.5 22h15c1.381 0 2.5-1.119 2.5-2.5v-11C22 7.119 20.881 6 19.5 6zM9.5 4.5c0-.276.224-.5.5-.5h4c.276 0 .5.224.5.5V6h-5V4.5zm10.5 15c0 .276-.224.5-.5.5h-15c-.276 0-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5h15c.276 0 .5.224.5.5v11z" />
              </svg>
            </div>
            <div className="text-[28px] font-bold text-[#E7E9EA]">{myBounties.length}</div>
          </div>

          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">Open Bounties</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="text-[28px] font-bold text-[#E7E9EA]">{openBounties.length}</div>
          </div>

          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">Completed</span>
              <svg viewBox="0 0 24 24" fill="#10B981" className="w-5 h-5">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </div>
            <div className="text-[28px] font-bold text-[#E7E9EA]">{completedBounties.length}</div>
          </div>

          <div className="bg-[#16181C] rounded-lg p-5 border border-[#2F3336]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#71767B] font-medium">Total Spent</span>
              <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-5 h-5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
            <div className="text-[28px] font-bold text-[#1D9BF0]">
              ${totalSpent.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-[17px] font-bold text-[#E7E9EA] mb-3">Quick Actions</h2>
          <div className="flex gap-3">
            <Link href="/bounties/create">
              <Button variant="primary">Post New Bounty</Button>
            </Link>
            <Link href="/applications">
              <Button variant="secondary">View Applications</Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#2F3336] mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('posted')}
              className={cn(
                'pb-3 text-[15px] font-medium transition-colors relative',
                activeTab === 'posted'
                  ? 'text-[#E7E9EA]'
                  : 'text-[#71767B] hover:text-[#E7E9EA]'
              )}
            >
              My Posted Bounties ({myBounties.length})
              {activeTab === 'posted' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={cn(
                'pb-3 text-[15px] font-medium transition-colors relative',
                activeTab === 'bookmarks'
                  ? 'text-[#E7E9EA]'
                  : 'text-[#71767B] hover:text-[#E7E9EA]'
              )}
            >
              Bookmarked ({bookmarkedBounties.length})
              {activeTab === 'bookmarks' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D9BF0] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Bounty Grid */}
        <BountyGrid bounties={displayedBounties} />
      </div>
    </MainLayout>
  );
}
