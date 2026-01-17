'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function TopNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-sm border-b border-[#2F3336]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo/Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/x-logo/logo-white.png"
                alt="X Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-[20px] font-bold text-[#E7E9EA]">Bounties</span>
            </Link>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-[15px] font-medium transition-colors hover:text-[#E7E9EA] ${
                  isActive('/') ? 'text-[#E7E9EA]' : 'text-[#71767B]'
                }`}
              >
                Browse Bounties
              </Link>
              <Link
                href="/applications"
                className={`text-[15px] font-medium transition-colors hover:text-[#E7E9EA] ${
                  isActive('/applications') ? 'text-[#E7E9EA]' : 'text-[#71767B]'
                }`}
              >
                My Applications
              </Link>
              <Link
                href="/bookmarks"
                className={`text-[15px] font-medium transition-colors hover:text-[#E7E9EA] ${
                  isActive('/bookmarks') ? 'text-[#E7E9EA]' : 'text-[#71767B]'
                }`}
              >
                Bookmarks
              </Link>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link href="/bounties/create">
              <Button variant="primary" size="md">
                Post Bounty
              </Button>
            </Link>
            <Link
              href="/dashboard"
              className={`p-2 rounded-full transition-colors hover:bg-white/[0.03] ${
                isActive('/dashboard') ? 'text-[#1D9BF0]' : 'text-[#71767B]'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
