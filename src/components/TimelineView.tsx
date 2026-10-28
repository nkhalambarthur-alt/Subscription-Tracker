import React, { useMemo } from 'react';
import { Subscription } from '../types';
import { getDaysUntilRenewal, formatCurrency, getRenewalAlertBadge } from '../utils/formatters';
import { Calendar, Clock, AlertTriangle, Flame, CreditCard, ExternalLink } from 'lucide-react';

interface TimelineViewProps {
  subscriptions: Subscription[];
  currency: 'USD' | 'EUR' | 'GBP';
  onOpenCancelAssistant: (sub: Subscription) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  subscriptions,
  currency,
  onOpenCancelAssistant,
}) => {
  // Sort by soonest renewal
  const sorted = useMemo(() => {
    return [...subscriptions].sort((a, b) =>
      a.nextRenewalDate.localeCompare(b.nextRenewalDate)
    );
  }, [subscriptions]);

  // Group into time windows:
  // 1. Next 72 Hours (Urgent Alerts)
  // 2. Days 4 to 14
  // 3. Days 15 to 30
  // 4. Later / Annual
  const groups = useMemo(() => {
    const next72h: Subscription[] = [];
    const next14d: Subscription[] = [];
    const next30d: Subscription[] = [];
    const future: Subscription[] = [];

    for (const sub of sorted) {
      const days = getDaysUntilRenewal(sub.nextRenewalDate);
      if (days >= 0 && days <= 3) {
        next72h.push(sub);
      } else if (days > 3 && days <= 14) {
        next14d.push(sub);
      } else if (days > 14 && days <= 30) {
        next30d.push(sub);
      } else {
        future.push(sub);
      }
    }

    const cost72h = next72h.reduce((sum, s) => sum + s.cost, 0);
    const cost14d = next14d.reduce((sum, s) => sum + s.cost, 0);

    return {
      next72h,
      next14d,
      next30d,
      future,
      cost72h,
      cost14d,
    };
  }, [sorted]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Cash Flow & Renewal Projection
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Upcoming Renewal Schedule
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            See exactly which cards will be charged and when. Monitor the 72-hour cancellation window to cancel before renewals execute.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#121826] p-3.5 rounded-xl border border-cyan-500/30 text-right">
            <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
              Due in Next 72h
            </span>
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(groups.cost72h, currency)}
            </span>
          </div>

          <div className="bg-[#121826] p-3.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[11px] font-mono text-slate-400 font-semibold block">
              Due in Next 14 Days
            </span>
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(groups.cost72h + groups.cost14d, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Group 1: Next 72 Hours (URGENT ALERT) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Urgent Window: Renewing within 72 Hours ({groups.next72h.length})
          </h3>
        </div>

        {groups.next72h.length === 0 ? (
          <div className="bg-[#0D121D] p-5 rounded-xl border border-slate-800 text-xs text-slate-400">
            No subscriptions are renewing in the next 3 days. Your accounts are safe from imminent auto-debits.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.next72h.map((sub) => {
              const days = getDaysUntilRenewal(sub.nextRenewalDate);
              const badge = getRenewalAlertBadge(days);

              return (
                <div
                  key={sub.id}
                  className="bg-[#111726] rounded-xl border border-cyan-500/50 p-4 space-y-3 shadow-lg shadow-cyan-950/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                      <span className="text-xs text-slate-400">{sub.category}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-400/80">
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                    <span className="text-lg font-bold text-white font-mono tabular-nums">
                      {formatCurrency(sub.cost, currency)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {sub.nextRenewalDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-400">{sub.paymentMethod}</span>
                    <button
                      onClick={() => onOpenCancelAssistant(sub)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs"
                    >
                      Cancel Steps →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Group 2: Days 4 - 14 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Next 14 Days ({groups.next14d.length})
        </h3>

        <div className="bg-[#0B0F19] rounded-xl border border-slate-800 divide-y divide-slate-800/80">
          {groups.next14d.map((sub) => {
            const days = getDaysUntilRenewal(sub.nextRenewalDate);

            return (
              <div
                key={sub.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: sub.accentColor }}
                  />
                  <div>
                    <span className="font-bold text-white text-sm block truncate">
                      {sub.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {sub.category} · {sub.familyMember}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono text-cyan-300 block">
                      In {days} days
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {sub.nextRenewalDate}
                    </span>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-bold text-white font-mono tabular-nums">
                      {formatCurrency(sub.cost, currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group 3: Days 15 to 30 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase font-mono tracking-wider">
          Later this Month (15 - 30 Days) ({groups.next30d.length})
        </h3>

        <div className="bg-[#0B0F19] rounded-xl border border-slate-800 divide-y divide-slate-800/80">
          {groups.next30d.map((sub) => {
            const days = getDaysUntilRenewal(sub.nextRenewalDate);

            return (
              <div
                key={sub.id}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: sub.accentColor }}
                  />
                  <span className="font-medium text-white text-xs">{sub.name}</span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xs text-slate-400 font-mono">
                    {sub.nextRenewalDate} ({days}d)
                  </span>
                  <span className="text-xs font-bold text-white font-mono tabular-nums min-w-[60px] text-right">
                    {formatCurrency(sub.cost, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
