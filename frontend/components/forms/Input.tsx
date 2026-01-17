import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[15px] font-medium text-[#E7E9EA] mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-transparent border rounded-lg px-4 py-3 text-[15px] text-[#E7E9EA] placeholder-[#71767B] outline-none transition-colors',
          error
            ? 'border-[#F4212E] focus:border-[#F4212E]'
            : 'border-[#2F3336] focus:border-[#1D9BF0]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-[13px] text-[#F4212E]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-[13px] text-[#71767B]">{helperText}</p>
      )}
    </div>
  );
}
