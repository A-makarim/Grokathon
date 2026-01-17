'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Bounty } from '@/lib/types';
import { mockBounties } from '@/lib/mockData';

interface BountiesContextType {
  bounties: Bounty[];
  bookmarkedBountyIds: Set<string>;
  toggleBookmark: (bountyId: string) => void;
  addBounty: (bounty: Bounty) => void;
}

const BountiesContext = createContext<BountiesContextType | undefined>(undefined);

export function BountiesProvider({ children }: { children: React.ReactNode }) {
  const [bounties, setBounties] = useState<Bounty[]>(mockBounties);
  const [bookmarkedBountyIds, setBookmarkedBountyIds] = useState<Set<string>>(
    new Set()
  );

  const toggleBookmark = (bountyId: string) => {
    setBookmarkedBountyIds((prev) => {
      const next = new Set(prev);
      if (next.has(bountyId)) {
        next.delete(bountyId);
      } else {
        next.add(bountyId);
      }
      return next;
    });
  };

  const addBounty = (bounty: Bounty) => {
    setBounties((prev) => [bounty, ...prev]);
  };

  return (
    <BountiesContext.Provider
      value={{
        bounties,
        bookmarkedBountyIds,
        toggleBookmark,
        addBounty,
      }}
    >
      {children}
    </BountiesContext.Provider>
  );
}

export function useBounties() {
  const context = useContext(BountiesContext);
  if (context === undefined) {
    throw new Error('useBounties must be used within a BountiesProvider');
  }
  return context;
}
