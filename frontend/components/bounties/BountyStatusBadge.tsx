import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BountyStatus } from '@/lib/types';

interface BountyStatusBadgeProps {
  status: BountyStatus;
  /** When true and status is pending/open, shows subtle text instead of a badge */
  isOwner?: boolean;
}

export function BountyStatusBadge({ status, isOwner }: BountyStatusBadgeProps) {
  const statusConfig: Record<BountyStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'error' | 'primary' }> = {
    open: {
      label: 'Open',
      variant: 'success',
    },
    pending: {
      label: 'Pending',
      variant: 'warning',
    },
    in_progress: {
      label: 'In Progress',
      variant: 'primary',
    },
    completed: {
      label: 'Completed',
      variant: 'secondary',
    },
    cancelled: {
      label: 'Cancelled',
      variant: 'error',
    },
  };

  // For owners viewing open/pending bounties, show subtle text instead of a badge
  if (isOwner && (status === 'open' || status === 'pending')) {
    return (
      <span className="text-[13px] text-[#71767B] italic">
        Awaiting assignment
      </span>
    );
  }

  const config = statusConfig[status] || statusConfig.open;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
