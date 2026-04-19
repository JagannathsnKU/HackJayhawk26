import type { TripSummary } from '../models/types';

/**
 * Representative sample itineraries for previews and planning flows.
 */
export type SampleActivity = {
  id: string;
  timeLabel: string;
  title: string;
  detail?: string;
};

export type SampleItinerary = {
  id: string;
  title: string;
  sourceFile: string;
  routeSummary: string;
  activities: SampleActivity[];
};

export const SAMPLE_ITINERARIES: SampleItinerary[] = [
  {
    id: 'domestic',
    title: 'Domestic · Client review',
    sourceFile: 'Domestic itinerary.pdf',
    routeSummary: 'SFO → ORD · 2 days · corporate preferred carriers',
    activities: [
      { id: 'd1', timeLabel: '06:15', title: 'Car service pickup', detail: 'SFO departures · Terminal 2' },
      { id: 'd2', timeLabel: '09:05', title: 'UA 1234 · SFO–ORD', detail: 'Economy · Seat 14C · Group 2 boarding' },
      { id: 'd3', timeLabel: '15:20', title: 'Arrive ORD · Ground to Loop', detail: 'Approved vendor sedan' },
      { id: 'd4', timeLabel: '17:00', title: 'Hotel check-in', detail: 'Westin River North · conf code LKT-8841' },
      { id: 'd5', timeLabel: '19:30', title: 'Team dinner', detail: 'River North · $75 meal policy' },
      { id: 'd6', timeLabel: 'Day 2 · 09:00', title: 'Client workshop', detail: 'Willis Tower · visitor badge 9F' },
      { id: 'd7', timeLabel: 'Day 2 · 16:40', title: 'ORD–SFO return', detail: 'UA 1888 · Economy Plus' },
    ],
  },
  {
    id: 'intl-1',
    title: 'International 1 · APAC sprint',
    sourceFile: 'international itinerary 1.pdf',
    routeSummary: 'LAX → NRT · 5 nights · visa waiver eligible corridor',
    activities: [
      { id: 'i1a', timeLabel: 'Day 1 · 11:20', title: 'JL 015 LAX–NRT', detail: 'Economy · meal pre-selected' },
      { id: 'i1b', timeLabel: 'Day 2 · 15:05', title: 'Immigration & Narita Express', detail: 'Suica mobile ready' },
      { id: 'i1c', timeLabel: 'Day 2 · 18:00', title: 'Hotel check-in Shinjuku', detail: 'Corporate rate · late arrival note' },
      { id: 'i1d', timeLabel: 'Day 3 · 10:00', title: 'APAC partner sessions', detail: 'Tower B · floors 22–24' },
      { id: 'i1e', timeLabel: 'Day 5 · 14:00', title: 'Policy review with local counsel', detail: 'Virtual backup link in calendar' },
      { id: 'i1f', timeLabel: 'Day 6 · 10:55', title: 'JL 058 NRT–SFO', detail: 'Return · baggage 2PC' },
    ],
  },
  {
    id: 'intl-2',
    title: 'International 2 · EU compliance week',
    sourceFile: 'international itinerary 2.pdf',
    routeSummary: 'JFK → LHR → BRU · rail segment included',
    activities: [
      { id: 'i2a', timeLabel: 'Day 1 · 18:45', title: 'BA 112 JFK–LHR', detail: 'Economy · T8 check-in' },
      { id: 'i2b', timeLabel: 'Day 2 · 07:30', title: 'Eurostar LHR zone transfer', detail: 'Paddington → St Pancras' },
      { id: 'i2c', timeLabel: 'Day 2 · 11:04', title: 'Eurostar to Brussels', detail: 'Standard premier · seat 05D' },
      { id: 'i2d', timeLabel: 'Day 2 · 15:00', title: 'EU policy workshop', detail: 'Avenue Louise office' },
      { id: 'i2e', timeLabel: 'Day 4 · 09:20', title: 'BRU–JFK via LHR', detail: 'Connection 95m · lounge eligible' },
    ],
  },
  {
    id: 'intl-3',
    title: 'International 3 · LATAM partner visit',
    sourceFile: 'international itinerary 3.pdf',
    routeSummary: 'MIA → BOG · overnight · security briefing attached',
    activities: [
      { id: 'i3a', timeLabel: 'Day 1 · 08:40', title: 'AA 921 MIA–BOG', detail: 'Economy · mobile boarding pass' },
      { id: 'i3b', timeLabel: 'Day 1 · 13:10', title: 'Arrival briefing & secure transport', detail: 'Approved vendor · plate logged' },
      { id: 'i3c', timeLabel: 'Day 1 · 16:00', title: 'Partner HQ sessions', detail: 'Chapinero · visitor escort' },
      { id: 'i3d', timeLabel: 'Day 3 · 19:25', title: 'AA 924 BOG–MIA', detail: 'Return · customs MIA CBP' },
    ],
  },
  {
    id: 'hotels',
    title: 'Hotel program · Confirmed stays',
    sourceFile: 'hotel_data.pdf',
    routeSummary: 'Preferred properties · nightly caps enforced in policy engine',
    activities: [
      { id: 'h1', timeLabel: 'Tokyo', title: 'Hotel New Otani', detail: '3 nights · breakfast · corp rate' },
      { id: 'h2', timeLabel: 'Chicago', title: 'Westin River North', detail: '2 nights · within $300 cap' },
      { id: 'h3', timeLabel: 'Brussels', title: 'Sofitel Europe', detail: 'EU cap · carbon offset bundled' },
    ],
  },
  {
    id: 'airline',
    title: 'Airline booking ledger',
    sourceFile: 'Airline booking data.pdf',
    routeSummary: 'Approved carriers · fare classes · record locators on file',
    activities: [
      { id: 'a1', timeLabel: 'PNR HJK84K', title: 'ANA / JL · Transpacific', detail: 'Economy baseline · upgrade queue open' },
      { id: 'a2', timeLabel: 'PNR ORD22L', title: 'United · Domestic US', detail: 'Economy Plus on longest segment' },
      { id: 'a3', timeLabel: 'PNR EU9F3', title: 'BA / AA · Atlantic', detail: 'Codeshare · baggage interlined' },
    ],
  },
];

/** Sample used as the “planning draft” row on the booking hub. */
export const PLANNING_SAMPLE_ITINERARY_ID = 'intl-1';

export function itineraryById(id: string): SampleItinerary | undefined {
  return SAMPLE_ITINERARIES.find((i) => i.id === id);
}

/** Read-only preview built from the active trip timeline. */
export function sampleItineraryFromTrip(trip: TripSummary): SampleItinerary {
  return {
    id: 'active-trip',
    title: `This trip · ${trip.destination}`,
    sourceFile: 'Current itinerary',
    routeSummary: `${trip.destinationCode} · in progress`,
    activities: trip.timelineToday.map((e) => ({
      id: e.id,
      timeLabel: e.timeLabel,
      title: e.title,
      detail: e.subtitle,
    })),
  };
}
