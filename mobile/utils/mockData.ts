import type {
  AppNotification,
  AssistantResolution,
  ItineraryItem,
  TripSummary,
} from '../models/types';

export const MOCK_TRIP: TripSummary = {
  id: 'trip-tokyo-001',
  destination: 'Tokyo',
  destinationCode: 'NRT',
  health: 'on_track',
  healthMessage: 'Everything looks aligned with policy and timing.',
  nextActionTitle: 'Boarding in 45 minutes',
  nextActionSubtitle: 'Gate B12 · ANA 107',
  dailyBudgetUsd: 300,
  approvalStatus: 'approved',
  timelineToday: [
    {
      id: 'tl-1',
      timeLabel: '07:30',
      title: 'Car to airport',
      subtitle: 'Driver confirmed',
    },
    {
      id: 'tl-2',
      timeLabel: '09:15',
      title: 'Depart SFO',
      subtitle: 'ANA 107',
    },
    {
      id: 'tl-3',
      timeLabel: '14:20',
      title: 'Arrive Narita',
      subtitle: 'Immigration & baggage',
    },
    {
      id: 'tl-4',
      timeLabel: '16:00',
      title: 'Hotel check-in',
      subtitle: 'Shinjuku',
    },
    {
      id: 'tl-5',
      timeLabel: '18:30',
      title: 'Client dinner',
      subtitle: 'Walking distance',
    },
  ],
};

export const MOCK_ITINERARY: ItineraryItem[] = [
  {
    id: 'it-1',
    kind: 'flight',
    title: 'SFO → NRT',
    subtitle: 'ANA 107 · Economy',
    startTime: '09:15',
    endTime: '14:20',
    location: 'San Francisco → Tokyo',
    statusBadge: 'safe',
    policyState: 'within_policy',
    spendAmount: 1180,
    spendLimit: 1400,
    vendorApproved: true,
    detailBullets: ['Economy · Lockton preferred carrier', 'Seat 22A', 'Meal: standard'],
  },
  {
    id: 'it-2',
    kind: 'hotel',
    title: 'Hotel New Otani',
    subtitle: '3 nights · Preferred vendor',
    startTime: 'Apr 18',
    endTime: 'Apr 21',
    location: 'Chiyoda, Tokyo',
    statusBadge: 'optimized',
    policyState: 'within_policy',
    spendAmount: 220,
    spendLimit: 300,
    vendorApproved: true,
    detailBullets: ['$220 / $300 nightly limit', 'Breakfast included', 'Corporate rate applied'],
  },
  {
    id: 'it-3',
    kind: 'meeting',
    title: 'Lockton APAC workshop',
    subtitle: 'Client session',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Shinjuku office tower',
    statusBadge: 'safe',
    policyState: 'within_policy',
    spendAmount: 0,
    spendLimit: 0,
    vendorApproved: true,
    detailBullets: ['Internal meeting', 'No spend'],
  },
  {
    id: 'it-4',
    kind: 'flight',
    title: 'NRT → SFO (return)',
    subtitle: 'JL 058 · Business (approval)',
    startTime: 'Apr 21 · 11:40',
    location: 'Tokyo → San Francisco',
    statusBadge: 'risk',
    policyState: 'requires_approval',
    spendAmount: 4200,
    spendLimit: 3200,
    vendorApproved: true,
    detailBullets: ['Business class requires approval', 'Above typical route cap'],
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Your gate changed',
    body: 'ANA 107 now departs from Gate B12.',
    timeLabel: '12 min ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'We fixed your booking',
    body: 'Hotel confirmation updated with late checkout.',
    timeLabel: '1 hr ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Leave now to arrive on time',
    body: 'Traffic is light — suggested departure in 8 minutes.',
    timeLabel: '2 hr ago',
    read: true,
  },
];

export function mockAssistantResolution(): AssistantResolution {
  return {
    message: "I've found 2 better options that keep you within policy and save time.",
    suggestions: [
      {
        id: 's1',
        title: 'Earlier ANA flight',
        summary: 'Arrives 55 minutes sooner, same fare class, preferred vendor.',
        priceUsd: 1165,
        savingsUsd: 40,
        etaMinutes: -55,
      },
      {
        id: 's2',
        title: 'Hotel swap · Shinjuku',
        summary: 'Closer to tomorrow’s meetings, within nightly limit, breakfast included.',
        priceUsd: 265,
        savingsUsd: 0,
      },
    ],
  };
}
