'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavigationItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export function NavigationItem({
  href,
  icon,
  label,
  active = false,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-full transition-colors',
        active
          ? 'font-bold'
          : 'hover:bg-white/[0.03]'
      )}
    >
      <span className={cn('text-[26px]', active ? 'text-[#E7E9EA]' : 'text-[#E7E9EA]')}>
        {icon}
      </span>
      <span className={cn('text-[20px]', active ? 'font-bold text-[#E7E9EA]' : 'text-[#E7E9EA]')}>
        {label}
      </span>
    </Link>
  );
}
