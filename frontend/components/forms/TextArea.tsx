import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
}

export function TextArea({
  label,
  error,
  showCount = false,
  maxLength,
  value,
  className,
  ...props
}: TextAreaProps) {
  const currentLength =
    typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[15px] font-medium text-[#E7E9EA] mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full bg-transparent border rounded-lg px-4 py-3 text-[15px] text-[#E7E9EA] placeholder-[#71767B] outline-none transition-colors resize-none',
          error
            ? 'border-[#F4212E] focus:border-[#F4212E]'
            : 'border-[#2F3336] focus:border-[#1D9BF0]',
          className
        )}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div className="flex items-center justify-between mt-2">
        {error ? (
          <p className="text-[13px] text-[#F4212E]">{error}</p>
        ) : (
          <div />
        )}
        {showCount && maxLength && (
          <p
            className={cn(
              'text-[13px]',
              currentLength > maxLength * 0.9
                ? 'text-[#FFD400]'
                : 'text-[#71767B]'
            )}
          >
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
