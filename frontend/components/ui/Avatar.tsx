import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  verified?: boolean;
  className?: string;
}

const DEFAULT_AVATAR = '/default-avatar.svg';

export function Avatar({
  src,
  alt,
  size = 'md',
  verified = false,
  className,
}: AvatarProps) {
  const sizeStyles = {
    xs: 'w-6 h-6',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32',
  };

  const verifiedSizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10',
  };

  // Use default avatar if src is empty, null, or undefined
  const imageSrc = src && src.trim() !== '' ? src : DEFAULT_AVATAR;

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn('rounded-full overflow-hidden', sizeStyles[size])}>
        <Image
          src={imageSrc}
          alt={alt}
          width={128}
          height={128}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
      {verified && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 bg-[#1D9BF0] rounded-full flex items-center justify-center',
            verifiedSizeStyles[size]
          )}
        >
          <svg
            viewBox="0 0 22 22"
            className="w-full h-full p-0.5"
            fill="white"
          >
            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
          </svg>
        </div>
      )}
    </div>
  );
}
