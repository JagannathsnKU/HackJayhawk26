import type { ItineraryItem, ItemKind, ItemStatusBadge, PolicyState, TripHealth, TripSummary } from '../models/types';
import { MOCK_ITINERARY, MOCK_TRIP } from '../utils/mockData';
import { backendFetch } from './apiClient';

export interface TravelService {
  getTrip(): Promise<TripSummary>;
  getItinerary(): Promise<ItineraryItem[]>;
}

export function createMockTravelService(): TravelService {
  return {
    async getTrip() {
      return { ...MOCK_TRIP };
    },
    async getItinerary() {
      return MOCK_ITINERARY.map((i) => ({ ...i }));
    },
  };
}

export function createApiTravelService(): TravelService {
  async function fetchMemory(): Promise<Record<string, unknown>> {
    const res = await backendFetch('/memory');
    if (!res.ok) throw new Error(`/memory returned ${res.status}`);
    return res.json() as Promise<Record<string, unknown>>;
  }

  return {
    async getTrip() {
      const data = await fetchMemory();
      const trip = data.current_trip as Record<string, string> | null;
      const budgetDrops = trip ? parseInt(trip.budget_drops ?? '5000000', 10) : 5000000;
      const usedXrp = (data.budget_used_xrp as number) ?? 0;
      const budgetXrp = budgetDrops / 1_000_000;
      const health: TripHealth =
        usedXrp > budgetXrp * 0.9 ? 'needs_attention' : usedXrp > budgetXrp * 0.7 ? 'at_risk' : 'on_track';
      const totalBookings = (data.total_bookings as number) ?? 0;
      const recentBookings = (data.recent_bookings as Record<string, unknown>[]) ?? [];

      return {
        id: 'trip-api',
        destination: trip?.destination ?? 'Your Trip',
        destinationCode: (trip?.destination ?? 'TRP').slice(0, 3).toUpperCase(),
        health,
        healthMessage: `${totalBookings} booking(s) · ${usedXrp.toFixed(2)} XRP spent`,
        nextActionTitle: totalBookings > 0 ? 'View Bookings' : 'Book Travel',
        nextActionSubtitle: trip ? `Started ${trip.start_date}` : undefined,
        dailyBudgetUsd: Math.round(budgetXrp * 0.5),
        approvalStatus: 'approved',
        timelineToday: recentBookings.map((b, i) => ({
          id: (b.booking_id as string) ?? `item-${i}`,
          timeLabel: new Date(b.timestamp as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `${b.type} — ${b.city}`,
          subtitle: `${b.amount_xrp} XRP`,
        })),
      };
    },

    async getItinerary() {
      const data = await fetchMemory();
      const bookings = (data.recent_bookings as Record<string, unknown>[]) ?? [];
      const VALID_KINDS = new Set(['flight', 'hotel', 'meeting']);
      return bookings.map((b) => ({
        id: (b.booking_id as string) ?? `item-${Math.random()}`,
        kind: (VALID_KINDS.has(b.type as string) ? b.type : 'hotel') as ItemKind,
        title: `${String(b.type ?? 'booking').charAt(0).toUpperCase() + String(b.type ?? 'booking').slice(1)} — ${b.city}`,
        subtitle: (b.date as string) ?? (b.timestamp as string),
        startTime: (b.timestamp as string) ?? new Date().toISOString(),
        location: (b.city as string) ?? 'Unknown',
        statusBadge: 'safe' as ItemStatusBadge,
        policyState: 'within_policy' as PolicyState,
        spendAmount: (b.amount_xrp as number) ?? 0,
        spendLimit: 5,
        vendorApproved: true,
        detailBullets: [
          `XRPL: ${String(b.xrpl_tx_hash ?? '').slice(0, 16)}…`,
          ...(b.solana_mint ? [`Solana NFT: ${String(b.solana_mint).slice(0, 12)}…`] : []),
        ],
      }));
    },
  };
}
