import type { ItineraryItem, TripSummary } from '../models/types';
import { MOCK_ITINERARY, MOCK_TRIP } from '../utils/mockData';

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
