import React from 'react';
import { BurnRateSummary } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, AlertTriangle, Calendar, Flame, DollarSign, Zap } from 'lucide-react';

interface BurnRateHeaderProps {
  summary: BurnRateSummary;
  currency: 'USD' | 'EUR' | 'GBP';
  onCurrencyChange: (c: 'USD' | 'EUR' | 'GBP') => void;
  onFilterZombies: () => void;
  onFilterRenewingSoon: () => void;
  isZombieFilterActive: boolean;
  isRenewingFilterActive: boolean;
}

export const BurnRateHeader: React.FC<BurnRateHeaderProps> = ({
  summary,
  currency,
  onCurrencyChange,
  onFilterZombies,
  onFilterRenewingSoon,
  isZombieFilterActive,
  isRenewingFilterActive,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-[#0D131F] to-[#0A0E17] border border-slate-800/90 shadow-2xl p-6 sm:p-8">
      {/* Subtle neon gradient ambient background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header controls strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-wider uppercase text-cyan-400">
              <Flame className="w-3.5 h-3.5" />
              Household Recurring Burn Rate
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Cash Outflow & Subscription Intelligence
          </h1>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-colors ${
                currency === curr
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
        {/* Metric 1: Monthly Total */}
        <div className="relative group bg-[#0F1626]/80 hover:bg-[#131C30]/90 p-5 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-wide">Monthly Burn</span>
            <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Fixed recurring
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {formatCurrency(summary.monthlyTotal, currency)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ mo</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Across {summary.activeCount} active services</span>
          </div>
        </div>

        {/* Metric 2: Annualized Total */}
        <div className="relative group bg-[#0F1626]/80 hover:bg-[#131C30]/90 p-5 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-wide">Annualized Total</span>
            <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              True commitment
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {formatCurrency(summary.annualTotal, currency)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ yr</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Total projected 12-month drain</span>
          </div>
        </div>

        {/* Metric 3: Zombie Savings Potential */}
        <button
          onClick={onFilterZombies}
          className={`text-left relative group p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
            isZombieFilterActive
              ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/50'
              : 'bg-[#161218]/90 hover:bg-[#1E1720] border-amber-900/40 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium tracking-wide text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Zombie Charges
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/50">
              {summary.zombieCount} detected
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums tracking-tight">
              {formatCurrency(summary.zombieMonthlySavings, currency)}
            </span>
            <span className="text-xs text-amber-300/80 font-medium">/ mo</span>
          </div>
          <div className="mt-3 text-xs text-amber-300/80 flex items-center justify-between">
            <span>Save {formatCurrency(summary.zombieAnnualSavings, currency)}/yr if cut</span>
            <span className="text-[11px] underline underline-offset-2 text-amber-400 font-medium">
              {isZombieFilterActive ? 'Clear filter' : 'Filter view'}
            </span>
          </div>
        </button>

        {/* Metric 4: Renewal Alerts within 3 days */}
        <button
          onClick={onFilterRenewingSoon}
          className={`text-left relative group p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
            isRenewingFilterActive
              ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400/50'
              : 'bg-[#0F1626]/80 hover:bg-[#131C30]/90 border-slate-800/80 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-wide text-cyan-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Renewals ≤ 3 Days
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                summary.renewingSoonCount > 0
                  ? 'text-cyan-300 bg-cyan-950/80 border-cyan-700/60 font-bold'
                  : 'text-slate-400 bg-slate-900 border-slate-800'
              }`}
            >
              {summary.renewingSoonCount} urgent
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-300 font-mono tabular-nums tracking-tight">
              {summary.renewingSoonCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">pending charges</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Action window open</span>
            <span className="text-[11px] underline underline-offset-2 text-cyan-400 font-medium">
              {isRenewingFilterActive ? 'Clear filter' : 'View charges'}
            </span>
          </div>
        </button>
      </div>
    </section>
  );
};
