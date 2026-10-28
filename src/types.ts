export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'weekly';

export type Category = 
  | 'Streaming & Media'
  | 'Developer & Cloud'
  | 'Productivity & SaaS'
  | 'Health & Fitness'
  | 'Utilities & Security'
  | 'AI & Tech'
  | 'Lifestyle & News';

export type UsageLevel = 'Low' | 'Medium' | 'High';

export type FamilyMember = 
  | 'Shared Family'
  | 'Alex (Parent)'
  | 'Jordan (Parent)'
  | 'Leo (Teen)'
  | 'Work / Office';

export interface Subscription {
  id: string;
  name: string;
  cost: number; // cost per billing cycle
  currency: 'USD' | 'EUR' | 'GBP';
  billingCycle: BillingCycle;
  category: Category;
  nextRenewalDate: string; // YYYY-MM-DD
  familyMember: FamilyMember;
  usage: UsageLevel;
  isZombie: boolean;
  zombieReason?: string;
  paymentMethod: string;
  iconName?: string;
  accentColor: string; // Neon accent hex or tailwind class
  cancelUrl?: string;
  notes?: string;
  isPaused?: boolean;
}

export type SortOption = 
  | 'highest_cost'
  | 'soonest_renewal'
  | 'lowest_cost'
  | 'name_asc'
  | 'zombie_first';

export type ViewTab = 'dashboard' | 'zombie_audit' | 'timeline' | 'family_split';

export interface BurnRateSummary {
  monthlyTotal: number;
  annualTotal: number;
  zombieMonthlySavings: number;
  zombieAnnualSavings: number;
  zombieCount: number;
  renewingSoonCount: number;
  activeCount: number;
}
