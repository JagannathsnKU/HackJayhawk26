/**
 * Lockton Associate Travel — policy presentation layer (frontend template).
 *
 * Lockton’s authoritative travel rules live in internal HR / Global Travel documents
 * (not publicly distributed). This file structures how those rules SHOULD surface in-app:
 * plain language, approvals, escalation, disruptions, privacy.
 *
 * Replace `officialDocument` and `contacts` with values from your current Associate handbook,
 * Concur (or equivalent) configuration, and benefits / assistance materials.
 */

export const POLICY_UI_DISCLAIMER =
  'This screen summarizes how travel policy is shown in the app. It is not a legal interpretation. For binding rules, use your official Lockton Associate travel and expense documents.';

export const officialDocument = {
  title: 'Associate Travel & Expense Policy',
  /** Paste the internal policy name / version employees are directed to (e.g. Concur, intranet). */
  whereToFind: 'Your official source: Lockton intranet → HR / Global Travel (replace with exact path).',
  lastUpdatedDisplay: 'Replace with published revision date from policy owner.',
};

export const programSummary = {
  headline: 'Travel that stays compliant without slowing you down',
  body:
    'Use your company booking and expense tools, get the right approvals before you commit spend, keep receipts, and know who to call when plans change. The app highlights what matters so you are not guessing.',
};

/** Plain-language pillars — align wording with your published policy; no dollar amounts here. */
export const policyPillars = [
  {
    id: 'book',
    title: 'Book the approved way',
    body:
      'Arrange air, hotel, and car through the travel program your organization designates (for example, your online booking tool or travel management company). In-app visibility helps security and duty-of-care teams support you.',
  },
  {
    id: 'class',
    title: 'Class of service & upgrades',
    body:
      'Default to the class of service your policy allows (commonly economy for domestic / short-haul). Upgrades, premium cabins, and non-standard routing usually need pre-approval — submit before ticketing when required.',
  },
  {
    id: 'lodging',
    title: 'Lodging & nightly limits',
    body:
      'Stay within published nightly caps and preferred or contracted properties where your program requires them. If the only suitable option is above limit, document the business reason and request approval per policy.',
  },
  {
    id: 'meals',
    title: 'Meals & incidentals',
    body:
      'Follow per-diem or receipt rules in your expense policy. Alcohol and entertainment often have separate approval or documentation rules — check your official guide.',
  },
  {
    id: 'expense',
    title: 'Receipts & substantiation',
    body:
      'Keep itemized receipts and business purpose notes as required for audit and tax substantiation. Corporate card and out-of-pocket rules may differ.',
  },
  {
    id: 'intl',
    title: 'International & high-risk travel',
    body:
      'International trips may require additional registration, visa checks, or security review. Do not book restricted destinations without explicit clearance from the channels your policy names.',
  },
] as const;

export const approvalGuide = {
  title: 'How approvals work (typical flow)',
  steps: [
    'Confirm trip purpose and dates; estimate total trip cost.',
    'Build options in your approved booking tool so policy flags (class, rate caps, vendor) are visible before purchase.',
    'If the tool shows “approval required” or an exception, submit the request with business justification and wait for decision.',
    'After approval, complete booking; store confirmation numbers in your itinerary.',
    'If plans change, re-check policy before rebooking — exchanges can trigger new approvals.',
  ],
};

export const escalationPaths = [
  {
    id: 'mgr',
    situation: 'Policy exception or spend above your authority',
    nextStep: 'Contact your manager or designated approver through the same channel your travel tool uses for approvals.',
    escalateIf: 'Urgent departure and approver unavailable — use the after-hours path your Global Travel team publishes.',
  },
  {
    id: 'travel',
    situation: 'Booking failure, vendor issue, or tool error',
    nextStep: 'Open a case with your travel management provider or internal travel desk (number in your policy).',
    escalateIf: 'Safety or security concern — use your traveler assistance / security hotline from benefits materials.',
  },
  {
    id: 'security',
    situation: 'Safety, security, or medical emergency while traveling',
    nextStep:
      'Follow your duty-of-care instructions: assistance line first, then notify your manager and Lockton security / crisis contact if your program requires it.',
    escalateIf: 'Local emergency services when life safety is at risk; then notify assistance.',
  },
] as const;

export const disruptionPlaybook = {
  title: 'During a disruption',
  intro:
    'Airlines and hotels change plans. Use this sequence so you stay within policy and get support quickly.',
  steps: [
    'Check airline or hotel app for official rebooking options before buying a new ticket out-of-pocket.',
    'If you must spend to get home or to the next obligation, keep all receipts and note the business reason.',
    'Notify your manager if you will miss a client obligation or exceed normal spend; request retroactive approval if policy allows.',
    'Update your itinerary in the company system so duty-of-care knows where you are.',
    'For medical or security events, use your traveler assistance contact from benefits — not public social posts with personal details.',
  ],
};

export const privacyAndSecurity = {
  title: 'Privacy & security',
  bullets: [
    'The app should show the minimum trip detail needed for assistance — sensitive health data belongs in approved channels only.',
    'Use company-approved devices and VPN requirements when accessing itinerary and expense systems.',
    'Do not share national ID, passport numbers, or health information in open chat; use encrypted HR or travel workflows.',
    'Phishing often mimics airline and hotel emails — verify sender and links before entering credentials.',
  ],
};

/** Human-readable limit copy — pair with Concur rules when you connect a backend. Numeric caps belong in policy systems, not invented here. */
export const policyLimitNarrative = {
  hotel: 'Nightly lodging cap and preferred programs: see your published travel policy and booking tool.',
  meals: 'Meals / per-diem: see expense policy; alcohol and hosting rules may differ.',
  air: 'Default cabin and upgrade rules: see travel policy; premium cabins typically require pre-approval.',
  vendors: 'Use contracted or preferred suppliers where required; exceptions need documented approval.',
};

export const benefitsAndCoverageNote = {
  title: 'Insurance & assistance',
  body:
    'Lockton helps employers design travel and accident programs. Your personal coverage, assistance numbers, and claim steps are defined in your Lockton benefits / group policy documents — use those for “am I covered?” and claim filing.',
};

export const demoDataNotice =
  'Sample itinerary only — for UI validation. It does not reflect a real booking or real policy limits.';
