import type { ItineraryItem, TripSummary } from '../models/types';
import { DEMO_ITINERARY, DEMO_TRIP } from '../data/demoTrip';

export interface TravelService {
  getTrip(): Promise<TripSummary>;
  getItinerary(): Promise<ItineraryItem[]>;
}

export function createMockTravelService(): TravelService {
  return {
    async getTrip() {
      return { ...DEMO_TRIP };
    },
    async getItinerary() {
      return DEMO_ITINERARY.map((i) => ({ ...i }));
    },
  };
}
