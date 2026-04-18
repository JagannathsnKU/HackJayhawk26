/** Domain types for Intelligent Travel Companion (frontend only). */

export type TripHealth = 'on_track' | 'at_risk' | 'needs_attention';

export type ItemKind = 'flight' | 'hotel' | 'meeting';

export type ItemStatusBadge = 'safe' | 'risk' | 'optimized';

export type PolicyState = 'within_policy' | 'requires_approval' | 'not_allowed';

export type PolicyCheckLabel =
  | 'within_policy'
  | 'exceeds_limit'
  | 'requires_approval'
  | 'not_allowed';

export interface TimelineEntry {
  id: string;
  timeLabel: string;
  title: string;
  subtitle?: string;
}

export interface ItineraryItem {
  id: string;
  kind: ItemKind;
  title: string;
  subtitle: string;
  startTime: string;
  endTime?: string;
  location: string;
  statusBadge: ItemStatusBadge;
  policyState: PolicyState;
  spendAmount: number;
  spendLimit: number;
  vendorApproved: boolean;
  detailBullets: string[];
}

export interface TripSummary {
  id: string;
  destination: string;
  destinationCode: string;
  health: TripHealth;
  healthMessage: string;
  nextActionTitle: string;
  nextActionSubtitle?: string;
  /** When null, UI should not imply a numeric cap — use `budgetNote` and official policy. */
  dailyBudgetUsd: number | null;
  budgetNote: string;
  approvalStatus: 'approved' | 'pending' | 'denied';
  timelineToday: TimelineEntry[];
  /** Shown when using sample data — never present as a real trip. */
  demonstrationNotice?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  employeeId: string;
  department: string;
  homeAirport: string;
}

export interface PermissionSet {
  canBookInternational: boolean;
  canApproveOverPolicy: boolean;
  allowedVendors: string[];
}

export interface PolicyLimits {
  /** Where employees should confirm caps (intranet, Concur, handbook section). */
  officialSourceHint: string;
  hotelPerNightUsd: number | null;
  mealPerDayUsd: number | null;
  defaultFlightClass: 'economy';
  businessClassRequiresApproval: boolean;
  onlyApprovedVendors: boolean;
  hotelNote: string;
  mealNote: string;
  airNote: string;
  vendorNote: string;
}

export interface PolicyCheckResult {
  label: PolicyCheckLabel;
  message: string;
}

export interface BudgetSnapshot {
  dailyLimitUsd: number | null;
  spentTodayUsd: number;
  currency: string;
  limitNote: string;
}

export interface PaymentAuthorizationRequest {
  amountUsd: number;
  description: string;
  itineraryItemId?: string;
  vendorName?: string;
}

export interface PaymentAuthorizationResult {
  status: 'approved_auto' | 'requires_approval' | 'denied';
  reference: string;
}

export interface AssistantSuggestion {
  id: string;
  title: string;
  summary: string;
  priceUsd?: number;
  savingsUsd?: number;
  etaMinutes?: number;
}

export interface AssistantResolution {
  message: string;
  suggestions: AssistantSuggestion[];
}

export type IssueCategory = 'flight' | 'hotel' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
}

export interface HelpTopic {
  id: string;
  label: string;
  description: string;
}
