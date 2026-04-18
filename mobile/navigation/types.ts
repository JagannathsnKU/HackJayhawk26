import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ItineraryItem, PolicyState } from '../models/types';

export type RootStackParamList = {
  Home: undefined;
  Itinerary: undefined;
  ItemDetail: { itemId: string };
  Notifications: undefined;
  HelpInsurance: undefined;
  Expenses: undefined;
  FixSituation: undefined;
  PaymentApproval: {
    title: string;
    amountUsd: number;
    policyState: PolicyState;
    itineraryItemId?: string;
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export function findItineraryItem(items: ItineraryItem[], id: string): ItineraryItem | undefined {
  return items.find((i) => i.id === id);
}
