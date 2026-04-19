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
  dailyBudgetUsd: number;
  approvalStatus: 'approved' | 'pending' | 'denied';
  timelineToday: TimelineEntry[];
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
  hotelPerNightUsd: number;
  mealPerDayUsd: number;
  defaultFlightClass: 'economy';
  businessClassRequiresApproval: boolean;
  onlyApprovedVendors: boolean;
}

export interface PolicyCheckResult {
  label: PolicyCheckLabel;
  message: string;
}

export interface BudgetSnapshot {
  dailyLimitUsd: number;
  spentTodayUsd: number;
  currency: string;
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

export type IssueCategory = 'flight' | 'hotel' | 'general' | 'emergency';

/** Lanes for categorized companion insights (no internal codenames in UI). */
export type CompanionUpdateLane = 'safety' | 'economy';

export function companionLaneLabel(lane: CompanionUpdateLane): string {
  switch (lane) {
    case 'safety':
      return 'Flight Info';
    case 'economy':
      return 'Savings';
  }
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
  /** When set, surfaces as Safety vs Spend chips on Home / Updates. */
  lane?: CompanionUpdateLane;
}

/** Mock XRPL / identity + balances for Profile & demos. */
export interface WalletSnapshot {
  did: string;
  rlusdBalance: string;
  xrpBalance: string;
  tripEscrowUsd: string;
  lendingVaultAvailableUsd: string;
}

export type HookDecision = 'passed' | 'blocked' | 'pending';

/** Treasury hook evaluation — enforcement layer UI. */
export interface HookTransactionEvent {
  id: string;
  timeLabel: string;
  merchant: string;
  category: 'airline' | 'hotel' | 'ground' | 'other';
  amountUsd: number;
  decision: HookDecision;
  hookChecks: { id: string; label: string; ok: boolean }[];
  companionAuthorized: boolean;
  reference?: string;
}

export interface HelpTopic {
  id: string;
  label: string;
  description: string;
}
