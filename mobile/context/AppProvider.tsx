import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AssistantService } from '../services/assistantService';
import type { IdentityService } from '../services/identityService';
import type { PaymentService } from '../services/paymentService';
import type { PolicyService } from '../services/policyService';
import type { TravelService } from '../services/travelService';
import {
  createMockAssistantService,
  createMockIdentityService,
  createMockPaymentService,
  createMockPolicyService,
  createMockTravelService,
} from '../services';
import type {
  AppNotification,
  HookTransactionEvent,
  ItineraryItem,
  TripSummary,
  UserProfile,
  WalletSnapshot,
} from '../models/types';
import { MOCK_HOOK_EVENTS, MOCK_NOTIFICATIONS, MOCK_WALLET } from '../utils/mockData';

type Services = {
  travel: TravelService;
  policy: PolicyService;
  identity: IdentityService;
  payment: PaymentService;
  assistant: AssistantService;
};

type AppState = {
  services: Services;
  trip: TripSummary | null;
  itinerary: ItineraryItem[];
  user: UserProfile | null;
  notifications: AppNotification[];
  wallet: WalletSnapshot;
  hookEvents: HookTransactionEvent[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const defaultServices: Services = {
  travel: createMockTravelService(),
  policy: createMockPolicyService(),
  identity: createMockIdentityService(),
  payment: createMockPaymentService(),
  assistant: createMockAssistantService(),
};

export function AppProvider({
  children,
  services = defaultServices,
}: {
  children: React.ReactNode;
  services?: Services;
}) {
  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications] = useState<AppNotification[]>(() =>
    MOCK_NOTIFICATIONS.map((n) => ({ ...n })),
  );
  const [wallet] = useState<WalletSnapshot>(() => ({ ...MOCK_WALLET }));
  const [hookEvents] = useState<HookTransactionEvent[]>(() => MOCK_HOOK_EVENTS.map((h) => ({ ...h })));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [t, items, u] = await Promise.all([
        services.travel.getTrip(),
        services.travel.getItinerary(),
        services.identity.getUser(),
      ]);
      setTrip(t);
      setItinerary(items);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, [services]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      services,
      trip,
      itinerary,
      user,
      notifications,
      wallet,
      hookEvents,
      loading,
      refresh,
    }),
    [services, trip, itinerary, user, notifications, wallet, hookEvents, loading, refresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}
