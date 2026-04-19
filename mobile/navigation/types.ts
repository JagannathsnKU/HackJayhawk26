import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ItineraryItem, PolicyState } from '../models/types';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainHome: undefined;
  PlanNewTrip: undefined;
  CurrentTrip: undefined;
  Badges: undefined;
  BookingHub: undefined;
  BudgetPlanning: undefined;
  BudgetCurrentTrip: undefined;
  CompanyPolicyPlan: undefined;
  PackingList: undefined;
  CurrentBookings: undefined;
  CurrentMeetings: undefined;
  FoodDiscover: undefined;
  TravelRouting: undefined;
  Profile: undefined;
  Transactions: undefined;
  Itinerary: undefined;
  ItemDetail: { itemId: string };
  Notifications: undefined;
  HelpInsurance: undefined;
  Expenses: undefined;
  FixSituation: { focus?: 'emergency' } | undefined;
  PaymentApproval: {
    title: string;
    amountUsd: number;
    policyState: PolicyState;
    itineraryItemId?: string;
  };
  PastTripSummary: { pastTripId: string };
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
