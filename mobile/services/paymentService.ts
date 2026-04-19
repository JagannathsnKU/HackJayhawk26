import type {
  BudgetSnapshot,
  PaymentAuthorizationRequest,
  PaymentAuthorizationResult,
} from '../models/types';
import { backendFetch } from './apiClient';

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

export function createApiPaymentService(): PaymentService {
  return {
    async authorizePayment(request) {
      const today = new Date().toISOString().split('T')[0];
      const res = await backendFetch('/agent/mock-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_city: request.vendorName ?? 'Travel',
          booking_type: 'hotel',
          travel_date: today,
          note: request.description,
          // amount_drops omitted — backend uses MOCK_BOOKING_AMOUNT_DROPS (1 XRP) from settings
        }),
      });
      if (!res.ok) {
        return { status: 'denied', reference: `ERR-${res.status}` };
      }
      const data = (await res.json()) as Record<string, unknown>;
      if (!data.ok) {
        return { status: 'denied', reference: (data.booking_id as string) ?? 'DENIED' };
      }
      return { status: 'approved_auto', reference: data.booking_id as string };
    },

    async checkBudget() {
      const res = await backendFetch('/memory');
      if (!res.ok) {
        return { dailyLimitUsd: 300, spentTodayUsd: 0, currency: 'USD' };
      }
      const data = (await res.json()) as Record<string, unknown>;
      const usedXrp = (data.budget_used_xrp as number) ?? 0;
      return {
        dailyLimitUsd: 300,
        spentTodayUsd: Math.round(usedXrp * 0.5),
        currency: 'USD',
      };
    },
  };
}
