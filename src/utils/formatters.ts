import { BillingCycle, Subscription, BurnRateSummary } from '../types';

// Anchor date for consistent calculation or relative to system time
export const CURRENT_DATE = new Date('2026-10-28T00:00:00');

export function normalizeMonthlyCost(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return cost;
    case 'yearly':
      return cost / 12;
    case 'quarterly':
      return cost / 3;
    case 'weekly':
      return (cost * 52) / 12;
    default:
      return cost;
  }
}

export function normalizeAnnualCost(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return cost * 12;
    case 'yearly':
      return cost;
    case 'quarterly':
      return cost * 4;
    case 'weekly':
      return cost * 52;
    default:
      return cost * 12;
  }
}

export function formatCurrency(amount: number, currency: 'USD' | 'EUR' | 'GBP' = 'USD'): string {
  const symbolMap = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbolMap[currency] || '$';
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getDaysUntilRenewal(dateStr: string, baseDate = CURRENT_DATE): number {
  const target = new Date(dateStr + 'T00:00:00');
  const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const diffTime = target.getTime() - base.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getRenewalAlertBadge(days: number): {
  isAlert: boolean;
  label: string;
  urgency: 'critical' | 'warning' | 'normal';
} {
  if (days < 0) {
    return { isAlert: true, label: 'Charge pending', urgency: 'critical' };
  }
  if (days === 0) {
    return { isAlert: true, label: 'Renews today', urgency: 'critical' };
  }
  if (days === 1) {
    return { isAlert: true, label: 'Renews tomorrow', urgency: 'critical' };
  }
  if (days === 2) {
    return { isAlert: true, label: 'Renews in 2 days', urgency: 'warning' };
  }
  if (days === 3) {
    return { isAlert: true, label: 'Renews in 3 days', urgency: 'warning' };
  }
  return { isAlert: false, label: `${days} days left`, urgency: 'normal' };
}

export function calculateBurnRate(subscriptions: Subscription[]): BurnRateSummary {
  const activeSubs = subscriptions.filter(s => !s.isPaused);
  
  let monthlyTotal = 0;
  let annualTotal = 0;
  let zombieMonthlySavings = 0;
  let zombieAnnualSavings = 0;
  let zombieCount = 0;
  let renewingSoonCount = 0;

  for (const sub of activeSubs) {
    const monthly = normalizeMonthlyCost(sub.cost, sub.billingCycle);
    const annual = normalizeAnnualCost(sub.cost, sub.billingCycle);
    
    monthlyTotal += monthly;
    annualTotal += annual;

    if (sub.isZombie) {
      zombieCount += 1;
      zombieMonthlySavings += monthly;
      zombieAnnualSavings += annual;
    }

    const days = getDaysUntilRenewal(sub.nextRenewalDate);
    if (days >= 0 && days <= 3) {
      renewingSoonCount += 1;
    }
  }

  return {
    monthlyTotal,
    annualTotal,
    zombieMonthlySavings,
    zombieAnnualSavings,
    zombieCount,
    renewingSoonCount,
    activeCount: activeSubs.length,
  };
}
