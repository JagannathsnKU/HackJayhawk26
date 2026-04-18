import type {
  AppNotification,
  AssistantResolution,
  ItineraryItem,
  TripSummary,
} from '../models/types';
import { demoDataNotice } from '../policy/locktonTravelProgram';

/**
 * Sample itinerary for UI / workflow testing only — not a real Lockton booking.
 * Policy outcomes (within / approval / not allowed) illustrate how the app behaves.
 */
export const DEMO_TRIP: TripSummary = {
  id: 'demo-trip-domestic-001',
  destination: 'Chicago (client visit)',
  destinationCode: 'ORD',
  health: 'on_track',
  healthMessage:
    'Bookings are in the approved channel, approvals captured, and timing looks workable. Confirm gate and hotel checkout in your airline and hotel apps.',
  nextActionTitle: 'Depart in about 90 minutes',
  nextActionSubtitle: 'Check airline app for gate · arrive at airport per policy lead time',
  dailyBudgetUsd: null,
  budgetNote: 'Per-diem and caps are defined in your official expense policy — confirm in Concur or the Associate handbook.',
  approvalStatus: 'approved',
  demonstrationNotice: demoDataNotice,
  timelineToday: [
    {
      id: 'tl-1',
      timeLabel: '07:00',
      title: 'Ground transport to airport',
      subtitle: 'Receipt if reimbursable per policy',
    },
    {
      id: 'tl-2',
      timeLabel: '09:30',
      title: 'Depart MCI',
      subtitle: 'Economy · approved itinerary',
    },
    {
      id: 'tl-3',
      timeLabel: '11:05',
      title: 'Arrive ORD',
      subtitle: 'Baggage claim / ground to client',
    },
    {
      id: 'tl-4',
      timeLabel: '14:00',
      title: 'Client working session',
      subtitle: 'Downtown · on-site',
    },
    {
      id: 'tl-5',
      timeLabel: '18:00',
      title: 'Hotel check-in',
      subtitle: 'Corporate rate · preferred market',
    },
  ],
};

export const DEMO_ITINERARY: ItineraryItem[] = [
  {
    id: 'it-1',
    kind: 'flight',
    title: 'MCI → ORD',
    subtitle: 'Economy · company booking tool',
    startTime: '09:30',
    endTime: '11:05',
    location: 'Kansas City → Chicago',
    statusBadge: 'safe',
    policyState: 'within_policy',
    spendAmount: 0,
    spendLimit: 0,
    vendorApproved: true,
    detailBullets: [
      'Booked in approved channel — required for visibility and duty of care.',
      'Economy aligns with typical default cabin rules; keep boarding pass and receipt in expense.',
    ],
  },
  {
    id: 'it-2',
    kind: 'hotel',
    title: 'Preferred program hotel',
    subtitle: 'Corporate rate · 2 nights',
    startTime: 'Check-in',
    endTime: 'Check-out',
    location: 'Chicago loop',
    statusBadge: 'optimized',
    policyState: 'within_policy',
    spendAmount: 0,
    spendLimit: 0,
    vendorApproved: true,
    detailBullets: [
      'Nightly cap and market rules: verify against your published travel policy.',
      'Incidentals: follow per-diem or itemized receipt rules in expense policy.',
    ],
  },
  {
    id: 'it-3',
    kind: 'meeting',
    title: 'Client discovery workshop',
    subtitle: 'Business purpose documented',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Client site',
    statusBadge: 'safe',
    policyState: 'within_policy',
    spendAmount: 0,
    spendLimit: 0,
    vendorApproved: true,
    detailBullets: [
      'No direct spend on this calendar block — meal receipts from client meals follow hosting / per-diem rules.',
    ],
  },
  {
    id: 'it-4',
    kind: 'flight',
    title: 'ORD → MCI (return)',
    subtitle: 'Business class (approval required)',
    startTime: 'Next day · 17:20',
    location: 'Chicago → Kansas City',
    statusBadge: 'risk',
    policyState: 'requires_approval',
    spendAmount: 0,
    spendLimit: 0,
    vendorApproved: true,
    detailBullets: [
      'Premium cabin typically requires pre-approval — do not ticket until approver records a decision.',
      'If you must fly for medical or accessibility reasons, document and route through HR / travel exception process per policy.',
    ],
  },
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Gate or terminal change',
    body: 'Check your airline app — carriers often update gates before the airport displays do.',
    timeLabel: '12 min ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Itinerary updated',
    body: 'Your hotel confirmation number changed after a rate refresh — receipt is in your email.',
    timeLabel: '1 hr ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Leave time suggestion',
    body: 'Traffic is heavier than usual — consider departing 10 minutes earlier to reach the client on time.',
    timeLabel: '2 hr ago',
    read: true,
  },
];

export function demoAssistantResolution(): AssistantResolution {
  return {
    message:
      'Here are two options that keep you in the approved booking channel and avoid out-of-pocket airfare where possible. Compare in your travel tool before confirming.',
    suggestions: [
      {
        id: 's1',
        title: 'Earlier economy departure',
        summary: 'Same route, arrives sooner, still economy — run through policy check in your booking tool.',
        priceUsd: undefined,
        savingsUsd: undefined,
        etaMinutes: -40,
      },
      {
        id: 's2',
        title: 'Hotel closer to tomorrow’s meetings',
        summary: 'Within preferred market; verify nightly rate against your cap before booking.',
        priceUsd: undefined,
      },
    ],
  };
}
