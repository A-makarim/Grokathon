/**
 * Constants for xBounty
 */

import type { BountyCategory, Currency, JobComplexity } from './types';

export const BOUNTY_CATEGORIES: BountyCategory[] = [
  'development',
  'design',
  'writing',
  'marketing',
  'research',
  'other',
];

export const CATEGORY_LABELS: Record<BountyCategory, string> = {
  development: 'Development',
  design: 'Design',
  writing: 'Writing',
  marketing: 'Marketing',
  research: 'Research',
  other: 'Other',
};

export const CURRENCIES: Currency[] = ['USD', 'ETH', 'SOL', 'USDC'];

export const JOB_COMPLEXITIES: { value: JobComplexity; label: string }[] = [
  { value: 'SIMPLE', label: 'Simple' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'COMPLEX', label: 'Complex' },
];

export const DEFAULT_CURRENCY: Currency = 'USD';

export const MIN_BID_AMOUNT = 1;
export const MAX_TITLE_LENGTH = 150;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_COVER_LETTER_LENGTH = 500;

