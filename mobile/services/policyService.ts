import type {
  ItineraryItem,
  PolicyCheckResult,
  PolicyLimits,
} from '../models/types';
import { policyLimitNarrative } from '../policy/locktonTravelProgram';

export interface PolicyService {
  checkPolicy(item: ItineraryItem): Promise<PolicyCheckResult>;
  getLimits(): Promise<PolicyLimits>;
}

export function createMockPolicyService(): PolicyService {
  return {
    async checkPolicy(item) {
      if (item.policyState === 'not_allowed') {
        return {
          label: 'not_allowed',
          message:
            'This option is not permitted under the rules your organization publishes. Do not complete purchase without an approved exception.',
        };
      }
      if (item.policyState === 'requires_approval') {
        return {
          label: 'requires_approval',
          message:
            'An approver must record a decision in your travel or expense workflow before you ticket or commit non-refundable spend.',
        };
      }
      if (item.kind === 'hotel' && item.spendLimit > 0 && item.spendAmount > item.spendLimit) {
        return {
          label: 'exceeds_limit',
          message:
            'Estimated spend is above the cap your tool or policy shows for this market. Request an exception or choose another property.',
        };
      }
      return {
        label: 'within_policy',
        message:
          'Matches the policy checks surfaced in your booking and expense tools. Keep receipts and business purpose as your official guide requires.',
      };
    },
    async getLimits() {
      return {
        officialSourceHint:
          'Confirm all caps and markets in your Lockton Associate travel / expense policy and Concur (or equivalent) configuration.',
        hotelPerNightUsd: null,
        mealPerDayUsd: null,
        defaultFlightClass: 'economy',
        businessClassRequiresApproval: true,
        onlyApprovedVendors: true,
        hotelNote: policyLimitNarrative.hotel,
        mealNote: policyLimitNarrative.meals,
        airNote: policyLimitNarrative.air,
        vendorNote: policyLimitNarrative.vendors,
      };
    },
  };
}
