'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { BountyFeed } from '@/components/bounties/BountyFeed';
import { useBounties } from '@/contexts/BountiesContext';

export default function BrowseBounties() {
  const { bounties } = useBounties();

  return (
    <MainLayout>
      {/* Bounty Feed */}
      <BountyFeed bounties={bounties} />
    </MainLayout>
  );
}
