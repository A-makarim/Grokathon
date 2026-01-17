import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'secondary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-2.5 py-1 rounded-full text-[13px] font-medium';

  const variantStyles = {
    default: 'bg-[#16181C] text-[#E7E9EA] border border-[#2F3336]',
    primary: 'bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20',
    success: 'bg-[#00BA7C]/10 text-[#00BA7C] border border-[#00BA7C]/20',
    warning: 'bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/20',
    error: 'bg-[#F4212E]/10 text-[#F4212E] border border-[#F4212E]/20',
    secondary: 'bg-[#16181C] text-[#71767B] border border-[#2F3336]',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </span>
  );
}
