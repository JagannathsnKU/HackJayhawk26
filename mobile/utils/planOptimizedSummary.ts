/** One line after “Optimize everything”: what, price, short policy tag (~3 words). */
export type OptimizedBudgetLine = {
  id: string;
  label: string;
  cost: string;
  /** Very short — aim for ~3 words */
  policyHint: string;
};

export const PLAN_OPTIMIZED_LINES: OptimizedBudgetLine[] = [
  { id: 'out', label: 'Outbound flight', cost: '$1,180', policyHint: 'Alliance economy rule' },
  { id: 'ret', label: 'Return flight', cost: '$1,120', policyHint: 'Same fare bucket' },
  { id: 'htl', label: 'Hotel · 3 nights', cost: '$660', policyHint: 'Preferred vendor cap' },
  { id: 'car', label: 'Ground transport', cost: '$90', policyHint: 'Local ground tier' },
  { id: 'meal', label: 'Meal allowance', cost: '$375', policyHint: 'Tokyo per diem' },
];

/** Drives the small pie — same trip, proportional slices */
export const PLAN_OPTIMIZED_PIE_SLICES = [
  { label: 'Flights', value: 2300, color: '#38bdf8' },
  { label: 'Hotel', value: 660, color: '#a78bfa' },
  { label: 'Meals', value: 375, color: '#f472b6' },
  { label: 'Ground', value: 90, color: '#34d399' },
] as const;
