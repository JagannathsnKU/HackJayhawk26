import { SAMPLE_ITINERARIES } from './sampleItineraries';

/** Home list rows (no PDF filenames). Dates are mock, before Apr 18, 2026. */
export type PastTripListEntry = { id: string; dateLabel: string; title: string };

export const PAST_TRIP_LIST: PastTripListEntry[] = [
  { id: 'domestic', dateLabel: 'Mar 3–5, 2026', title: 'Domestic · Client review' },
  { id: 'intl-1', dateLabel: 'Jan 12–18, 2026', title: 'International 1 · APAC sprint' },
  { id: 'intl-2', dateLabel: 'Feb 4–8, 2026', title: 'International 2 · EU compliance week' },
  { id: 'intl-3', dateLabel: 'Mar 22–25, 2026', title: 'International 3 · LATAM partner visit' },
  { id: 'hotels', dateLabel: 'Feb 1, 2026', title: 'Hotel program · Confirmed stays' },
  { id: 'airline', dateLabel: 'Jan 5, 2026', title: 'Airline booking ledger' },
];

export type PastTripDetail = {
  id: string;
  dateLabel: string;
  title: string;
  routeSummary: string;
  bullets: string[];
};

export function getPastTripDetail(id: string): PastTripDetail | null {
  const sample = SAMPLE_ITINERARIES.find((s) => s.id === id);
  const list = PAST_TRIP_LIST.find((p) => p.id === id);
  if (!sample || !list) return null;
  const bullets = [
    sample.routeSummary,
    ...sample.activities.slice(0, 4).map((a) => `${a.timeLabel} · ${a.title}`),
  ];
  return {
    id: sample.id,
    dateLabel: list.dateLabel,
    title: sample.title,
    routeSummary: sample.routeSummary,
    bullets,
  };
}
