import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BountyStatus } from '@/lib/types';

interface BountyStatusBadgeProps {
  status: BountyStatus;
}

export function BountyStatusBadge({ status }: BountyStatusBadgeProps) {
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

  const config = statusConfig[status] || statusConfig.open;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
