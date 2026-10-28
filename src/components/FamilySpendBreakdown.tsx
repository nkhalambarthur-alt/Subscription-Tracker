import React, { useMemo } from 'react';
import { Subscription, FamilyMember } from '../types';
import { formatCurrency, normalizeMonthlyCost, normalizeAnnualCost } from '../utils/formatters';
import { Users, DollarSign, PieChart, ShieldAlert } from 'lucide-react';

interface FamilySpendBreakdownProps {
  subscriptions: Subscription[];
  currency: 'USD' | 'EUR' | 'GBP';
  onFilterMember: (member: FamilyMember) => void;
}

const MEMBERS: FamilyMember[] = [
  'Shared Family',
  'Alex (Parent)',
  'Jordan (Parent)',
  'Leo (Teen)',
  'Work / Office',
];

export const FamilySpendBreakdown: React.FC<FamilySpendBreakdownProps> = ({
  subscriptions,
  currency,
  onFilterMember,
}) => {
  const memberData = useMemo(() => {
    const totalMonthly = subscriptions.reduce(
      (sum, s) => sum + normalizeMonthlyCost(s.cost, s.billingCycle),
      0
    );

    return MEMBERS.map((member) => {
      const subs = subscriptions.filter((s) => s.familyMember === member);
      const monthly = subs.reduce(
        (sum, s) => sum + normalizeMonthlyCost(s.cost, s.billingCycle),
        0
      );
      const annual = subs.reduce(
        (sum, s) => sum + normalizeAnnualCost(s.cost, s.billingCycle),
        0
      );
      const zombies = subs.filter((s) => s.isZombie || s.usage === 'Low');
      const percentage = totalMonthly > 0 ? (monthly / totalMonthly) * 100 : 0;

      return {
        member,
        subs,
        monthly,
        annual,
        percentage,
        zombiesCount: zombies.length,
      };
    }).sort((a, b) => b.monthly - a.monthly);
  }, [subscriptions]);

  const totalMonthlySpend = subscriptions.reduce(
    (sum, s) => sum + normalizeMonthlyCost(s.cost, s.billingCycle),
    0
  );

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Family Member & Household Allocation
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Spend Distribution by Person
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Household Monthly Total</span>
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(totalMonthlySpend, currency)}
            </span>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Household Share of Outflow</span>
            <span>100% Normalized</span>
          </div>
          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
            {memberData.map((d, idx) => {
              const colors = [
                'bg-cyan-400',
                'bg-emerald-400',
                'bg-purple-400',
                'bg-amber-400',
                'bg-rose-400',
              ];
              return (
                <div
                  key={d.member}
                  style={{ width: `${Math.max(d.percentage, 3)}%` }}
                  className={`h-full ${colors[idx % colors.length]} transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                  title={`${d.member}: ${d.percentage.toFixed(1)}%`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {memberData.map((data, idx) => {
          const accentBorders = [
            'border-cyan-500/40',
            'border-emerald-500/40',
            'border-purple-500/40',
            'border-amber-500/40',
            'border-rose-500/40',
          ];

          return (
            <div
              key={data.member}
              className={`bg-[#0F1420] rounded-xl border ${accentBorders[idx % accentBorders.length]} p-5 flex flex-col justify-between space-y-4 shadow-lg shadow-slate-950/40`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {data.member}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {data.subs.length} active service{data.subs.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {data.percentage.toFixed(0)}% of total
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                    {formatCurrency(data.monthly, currency)}
                    <span className="text-xs text-slate-400 font-normal"> / mo</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatCurrency(data.annual, currency)} / yr
                  </span>
                </div>

                {/* Subscriptions mini-list */}
                <div className="mt-3.5 space-y-1.5">
                  {data.subs.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-950/60 border border-slate-800/60"
                    >
                      <span className="text-slate-300 truncate max-w-[150px]">{s.name}</span>
                      <span className="text-white font-mono tabular-nums">
                        {formatCurrency(s.cost, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {data.zombiesCount > 0 && (
                <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-600/30 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{data.zombiesCount} low-usage or zombie charge(s)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
