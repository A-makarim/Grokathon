'use client';

import React from 'react';
import { SearchWidget } from '@/components/widgets/SearchWidget';
import { TrendingWidget } from '@/components/widgets/TrendingWidget';
import { SuggestedWidget } from '@/components/widgets/SuggestedWidget';

export function RightSidebar() {
  return (
    <div className="w-[350px] h-screen sticky top-0 px-8 py-2 overflow-y-auto">
      <SearchWidget />
      <TrendingWidget />
      <SuggestedWidget />

      {/* Footer Links */}
      <div className="px-4 py-3 text-[13px] text-[#71767B] flex flex-wrap gap-2">
        <a href="#" className="hover:underline">
          Terms of Service
        </a>
        <span>·</span>
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
        <span>·</span>
        <a href="#" className="hover:underline">
          Cookie Policy
        </a>
        <span>·</span>
        <a href="#" className="hover:underline">
          About
        </a>
        <div className="w-full mt-2">© 2026 X Bounties</div>
      </div>
    </div>
  );
}
