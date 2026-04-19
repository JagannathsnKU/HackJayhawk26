import type {
  ItineraryItem,
  PolicyCheckResult,
  PolicyLimits,
} from '../models/types';

export interface PolicyService {
  checkPolicy(item: ItineraryItem): Promise<PolicyCheckResult>;
  getLimits(): Promise<PolicyLimits>;
}

export function createMockPolicyService(): PolicyService {
  return {
    async checkPolicy(item) {
      if (item.policyState === 'not_allowed') {
        return { label: 'not_allowed', message: 'This option is not permitted under current policy.' };
      }
      if (item.policyState === 'requires_approval') {
        return { label: 'requires_approval', message: 'Requires manager approval before booking.' };
      }
      if (item.kind === 'hotel' && item.spendAmount > 300) {
        return { label: 'exceeds_limit', message: 'Nightly rate exceeds $300 limit.' };
      }
      return { label: 'within_policy', message: 'Within Lockton travel policy.' };
    },
    async getLimits() {
      return {
        hotelPerNightUsd: 300,
        mealPerDayUsd: 75,
        defaultFlightClass: 'economy',
        businessClassRequiresApproval: true,
        onlyApprovedVendors: true,
      };
    },
  };
}
