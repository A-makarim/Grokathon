'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { BountyComposer } from '@/components/forms/BountyComposer';

export default function CreateBountyPage() {
  return (
    <MainLayout>
      <div>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-[#E7E9EA] mb-2">Post a New Bounty</h1>
          <p className="text-[15px] text-[#71767B]">
            Create a bounty and find talented developers to help you
          </p>
        </div>

        {/* Bounty Composer */}
        <BountyComposer />
      </div>
    </MainLayout>
  );
}
