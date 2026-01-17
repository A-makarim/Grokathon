import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white disabled:hover:bg-[#1D9BF0]',
    secondary:
      'bg-transparent border border-[#2F3336] text-[#E7E9EA] hover:bg-[#16181C] disabled:hover:bg-transparent',
    ghost:
      'bg-transparent text-[#E7E9EA] hover:bg-white/[0.03] disabled:hover:bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-[13px]',
    md: 'px-6 py-3 text-[15px]',
    lg: 'px-8 py-4 text-[17px]',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
