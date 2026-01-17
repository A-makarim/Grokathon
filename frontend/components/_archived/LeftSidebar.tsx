'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationItem } from './NavigationItem';
import { Button } from '@/components/ui/Button';

export function LeftSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913v-7.075h3.008v7.075c0 .502.418.913.929.913h6.639c.51 0 .928-.41.928-.913V7.904c0-.301-.158-.584-.408-.758z" />
        </svg>
      ),
    },
    {
      href: '/explore',
      label: 'Explore',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
        </svg>
      ),
    },
    {
      href: '/my-jobs',
      label: 'My Jobs',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M19.5 6h-3V4.5C16.5 3.119 15.381 2 14 2h-4C8.619 2 7.5 3.119 7.5 4.5V6h-3C3.119 6 2 7.119 2 8.5v11C2 20.881 3.119 22 4.5 22h15c1.381 0 2.5-1.119 2.5-2.5v-11C22 7.119 20.881 6 19.5 6zM9.5 4.5c0-.276.224-.5.5-.5h4c.276 0 .5.224.5.5V6h-5V4.5zm10.5 15c0 .276-.224.5-.5.5h-15c-.276 0-.5-.224-.5-.5v-11c0-.276.224-.5.5-.5h15c.276 0 .5.224.5.5v11z" />
        </svg>
      ),
    },
    {
      href: '/applications',
      label: 'Applications',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v3.5h-17V4.25c0-.413.337-.75.75-.75zm15.5 17h-15.5c-.413 0-.75-.337-.75-.75V9.5h17v10.25c0 .413-.337.75-.75.75z" />
          <path d="M8 11h8v2H8zm0 4h8v2H8z" />
        </svg>
      ),
    },
    {
      href: '/bookmarks',
      label: 'Bookmarks',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
        </svg>
      ),
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-[275px] h-screen sticky top-0 flex flex-col px-2 border-r border-[#2F3336]">
      {/* Logo */}
      <div className="px-3 py-2">
        <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/[0.03] transition-colors">
          <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-8 h-8">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        {navItems.map((item) => (
          <NavigationItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Post Job Button */}
      <div className="p-4">
        <Link href="/jobs/create">
          <Button fullWidth size="lg">
            Post Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
