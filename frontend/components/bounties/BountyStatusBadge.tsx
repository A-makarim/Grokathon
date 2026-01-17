import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BountyStatus } from '@/lib/types';

interface BountyStatusBadgeProps {
  status: BountyStatus;
}

export function BountyStatusBadge({ status }: BountyStatusBadgeProps) {
  const statusConfig = {
    open: {
      label: 'Open',
      variant: 'success' as const,
    },
    in_progress: {
      label: 'In Progress',
      variant: 'warning' as const,
    },
    completed: {
      label: 'Completed',
      variant: 'secondary' as const,
    },
    cancelled: {
      label: 'Cancelled',
      variant: 'error' as const,
    },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
