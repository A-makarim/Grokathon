'use client';

import React from 'react';
import { TopNav } from './TopNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
