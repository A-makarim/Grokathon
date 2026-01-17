/**
 * Utility functions for xBounty
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatReward(amount: number, currency: string = 'USD'): string {
  if (currency === 'USD' || currency === 'USDC') {
    return `$${amount.toLocaleString()}`;
  }
  return `${amount} ${currency}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'OPEN':
    case 'PENDING':
      return 'text-green-500';
    case 'IN_PROGRESS':
    case 'REVIEWED':
      return 'text-blue-500';
    case 'COMPLETED':
    case 'ACCEPTED':
      return 'text-emerald-500';
    case 'CANCELLED':
    case 'REJECTED':
      return 'text-red-500';
    case 'PENDING_APPROVAL':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

export function jobStatusToBountyStatus(status: string): 'open' | 'in_progress' | 'completed' | 'cancelled' | 'pending' {
  switch (status) {
    case 'OPEN':
      return 'open';
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    case 'PENDING_APPROVAL':
    default:
      return 'pending';
  }
}

