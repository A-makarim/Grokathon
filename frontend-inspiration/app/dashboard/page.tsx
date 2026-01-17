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
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-[#2F3336] mb-8">
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <p className="text-[13px] text-[#71767B] font-medium mb-2">Total Posted</p>
            <p className="text-[32px] font-bold text-[#E7E9EA]">{myBounties.length}</p>
          </div>
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[13px] text-[#71767B] font-medium">Open</p>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-[32px] font-bold text-[#E7E9EA]">{openBounties.length}</p>
          </div>
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <p className="text-[13px] text-[#71767B] font-medium mb-2">Completed</p>
            <p className="text-[32px] font-bold text-[#E7E9EA]">{completedBounties.length}</p>
          </div>
          <div className="border-r border-b border-[#2F3336] p-6 hover:bg-[#0A0A0A] transition-colors">
            <p className="text-[13px] text-[#71767B] font-medium mb-2">Total Spent</p>
            <p className="text-[32px] font-bold text-[#1D9BF0]">${totalSpent.toLocaleString()}</p>
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
