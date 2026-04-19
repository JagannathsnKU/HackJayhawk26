import { useCallback } from 'react';
import type { ItemStatusBadge, PolicyState, TripHealth } from '../models/types';

export function useFormatters() {
  const tripHealthLabel = useCallback((h: TripHealth) => {
    switch (h) {
      case 'on_track':
        return 'On Track';
      case 'at_risk':
        return 'At Risk';
      case 'needs_attention':
        return 'Needs Attention';
      default:
        return 'Status';
    }
  }, []);

  const badgeLabel = useCallback((b: ItemStatusBadge) => {
    switch (b) {
      case 'safe':
        return 'Safe';
      case 'risk':
        return 'Risk';
      case 'optimized':
        return 'Optimized';
      default:
        return '';
    }
  }, []);

  const policyLabel = useCallback((p: PolicyState) => {
    switch (p) {
      case 'within_policy':
        return 'Within policy';
      case 'requires_approval':
        return 'Requires approval';
      case 'not_allowed':
        return 'Not allowed';
      default:
        return '';
    }
  }, []);

  const currency = useCallback((n: number) => {
    if (n === 0) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      n,
    );
  }, []);

  return { tripHealthLabel, badgeLabel, policyLabel, currency };
}
