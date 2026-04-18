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
      // Frontend stub: deterministic mock only.
      if (request.amountUsd > 3500) {
        return { status: 'requires_approval', reference: 'MOCK-PAY-PENDING' };
      }
      if (request.amountUsd < 0) {
        return { status: 'denied', reference: 'MOCK-PAY-DENY' };
      }
      return { status: 'approved_auto', reference: 'MOCK-PAY-OK' };
    },
    async checkBudget() {
      return {
        dailyLimitUsd: 300,
        spentTodayUsd: 186,
        currency: 'USD',
      };
    },
  };
}
