import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ItineraryItem, PolicyState } from '../models/types';

export type MainTabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
  TransactionsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
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

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export function findItineraryItem(items: ItineraryItem[], id: string): ItineraryItem | undefined {
  return items.find((i) => i.id === id);
}
