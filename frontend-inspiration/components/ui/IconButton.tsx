import React from 'react';
import { cn } from '@/lib/utils';

export type IconButtonColor = 'default' | 'blue' | 'green' | 'red' | 'yellow';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: IconButtonColor;
  size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
  children,
  color = 'default',
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full transition-colors duration-200 group';

  const sizeStyles = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const colorStyles = {
    default: 'hover:bg-[#1D9BF0]/10',
    blue: 'hover:bg-[#1D9BF0]/10',
    green: 'hover:bg-[#00BA7C]/10',
    red: 'hover:bg-[#F4212E]/10',
    yellow: 'hover:bg-[#FFD400]/10',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], colorStyles[color], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Icon wrapper to apply color changes on hover
interface IconProps {
  children: React.ReactNode;
  color?: IconButtonColor;
  className?: string;
}

export function Icon({ children, color = 'default', className }: IconProps) {
  const colorStyles = {
    default: 'text-[#71767B] group-hover:text-[#1D9BF0]',
    blue: 'text-[#71767B] group-hover:text-[#1D9BF0]',
    green: 'text-[#71767B] group-hover:text-[#00BA7C]',
    red: 'text-[#71767B] group-hover:text-[#F4212E]',
    yellow: 'text-[#71767B] group-hover:text-[#FFD400]',
  };

  return (
    <span className={cn('transition-colors duration-200', colorStyles[color], className)}>
      {children}
    </span>
  );
}
