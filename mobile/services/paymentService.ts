import type {
  BudgetSnapshot,
  PaymentAuthorizationRequest,
  PaymentAuthorizationResult,
} from '../models/types';

export interface PaymentService {
  authorizePayment(request: PaymentAuthorizationRequest): Promise<PaymentAuthorizationResult>;
  checkBudget(): Promise<BudgetSnapshot>;
}

export function createMockPaymentService(): PaymentService {
  return {
    async authorizePayment(request) {
      if (request.amountUsd > 3500) {
        return { status: 'requires_approval', reference: 'PENDING-APPROVAL-STUB' };
      }
      if (request.amountUsd < 0) {
        return { status: 'denied', reference: 'DENY-STUB' };
      }
      return { status: 'approved_auto', reference: 'AUTO-STUB' };
    },
    async checkBudget() {
      return {
        dailyLimitUsd: null,
        spentTodayUsd: 0,
        currency: 'USD',
        limitNote:
          'Daily caps come from your expense policy — this row is illustrative until connected to Concur or payroll feeds.',
      };
    },
  };
}
