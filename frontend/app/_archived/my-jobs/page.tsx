'use client';

import { MainLayout } from '@/components/layout/MainLayout';

export default function MyJobsPage() {
  return (
    <MainLayout>
      <div>
        <div className="sticky top-0 z-10 bg-[#000000]/80 backdrop-blur-sm border-b border-[#2F3336] px-4 py-3">
          <h1 className="text-[20px] font-bold text-[#E7E9EA]">My Jobs</h1>
        </div>
        <div className="px-4 py-16 text-center">
          <p className="text-[15px] text-[#71767B]">
            My Jobs page coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
