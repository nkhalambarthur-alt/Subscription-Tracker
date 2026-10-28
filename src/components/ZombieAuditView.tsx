import React, { useMemo } from 'react';
import { Subscription, UsageLevel } from '../types';
import { formatCurrency, normalizeAnnualCost, normalizeMonthlyCost } from '../utils/formatters';
import { AlertTriangle, ShieldCheck, Flame, Scissors, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';

interface ZombieAuditViewProps {
  subscriptions: Subscription[];
  currency: 'USD' | 'EUR' | 'GBP';
  onToggleZombie: (id: string) => void;
  onUpdateUsage: (id: string, usage: UsageLevel) => void;
  onOpenCancelAssistant: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
}

export const ZombieAuditView: React.FC<ZombieAuditViewProps> = ({
  subscriptions,
  currency,
  onToggleZombie,
  onUpdateUsage,
  onOpenCancelAssistant,
  onEdit,
}) => {
  // Zombie subscriptions or Low usage subscriptions
  const flaggedZombies = useMemo(() => {
    return subscriptions.filter((s) => s.isZombie || s.usage === 'Low');
  }, [subscriptions]);

  // Redundancy analysis: Category clustering
  const redundancies = useMemo(() => {
    const streaming = subscriptions.filter((s) => s.category === 'Streaming & Media');
    const aiTools = subscriptions.filter((s) => s.category === 'AI & Tech');
    const list = [];

    if (streaming.length > 2) {
      const totalMonthly = streaming.reduce(
        (sum, s) => sum + normalizeMonthlyCost(s.cost, s.billingCycle),
        0
      );
      list.push({
        title: 'Streaming Overload Detected',
        description: `You have ${streaming.length} entertainment & video streaming services active at the same time.`,
        monthlyCost: totalMonthly,
        services: streaming,
        tip: 'Consider rotating 1-2 services month-by-month rather than paying for all simultaneously.',
      });
    }

    if (aiTools.length > 1) {
      const totalMonthly = aiTools.reduce(
        (sum, s) => sum + normalizeMonthlyCost(s.cost, s.billingCycle),
        0
      );
      list.push({
        title: 'Multiple AI Subscriptions',
        description: `You have ${aiTools.length} active AI subscriptions (e.g. ChatGPT, Midjourney).`,
        monthlyCost: totalMonthly,
        services: aiTools,
        tip: 'Consolidate onto a single primary model or pause generation subscriptions during quiet work months.',
      });
    }

    return list;
  }, [subscriptions]);

  const totalMonthlyWaste = flaggedZombies.reduce(
    (acc, s) => acc + normalizeMonthlyCost(s.cost, s.billingCycle),
    0
  );
  const totalAnnualWaste = flaggedZombies.reduce(
    (acc, s) => acc + normalizeAnnualCost(s.cost, s.billingCycle),
    0
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#131118] to-slate-900 border border-amber-600/40 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Zombie & Low-Usage Charge Intelligence
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Reclaim {formatCurrency(totalAnnualWaste, currency)} Every Year
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Subscriptions marked with <strong>Low usage</strong> or flagged as forgotten trials
              are quietly draining family cashflow. Audit them below and cancel with one click.
            </p>
          </div>

          {/* Quick metric badge */}
          <div className="bg-[#1A141D] p-4 rounded-xl border border-amber-700/50 text-right shrink-0">
            <div className="text-xs text-amber-300/90 font-medium">Monthly Drain</div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {formatCurrency(totalMonthlyWaste, currency)}
              <span className="text-xs text-amber-300/80 font-normal"> / mo</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              {flaggedZombies.length} services under review
            </div>
          </div>
        </div>
      </div>

      {/* Redundancy Alerts */}
      {redundancies.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Scissors className="w-4 h-4 text-cyan-400" />
            Duplicate & Redundant Category Warnings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redundancies.map((red, idx) => (
              <div
                key={idx}
                className="bg-[#0F1420] rounded-xl border border-slate-800 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{red.title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{red.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
                      {formatCurrency(red.monthlyCost, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ mo total</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {red.services.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 text-xs rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                    >
                      {s.name} ({formatCurrency(s.cost, currency)})
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-cyan-300/80 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/30 leading-snug">
                  💡 <strong>Tip:</strong> {red.tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of Flagged Services */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Flagged Zombie & Low-Usage Charges ({flaggedZombies.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click 'Cancel Guide' for official cancellation steps
          </span>
        </div>

        {flaggedZombies.length === 0 ? (
          <div className="bg-[#0B0F19] rounded-xl border border-slate-800 p-8 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Zero Zombie Charges Detected!</h4>
            <p className="text-xs text-slate-400">
              All your subscriptions are actively used. Great job managing household spend!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flaggedZombies.map((sub) => {
              const annual = normalizeAnnualCost(sub.cost, sub.billingCycle);
              const monthly = normalizeMonthlyCost(sub.cost, sub.billingCycle);

              return (
                <div
                  key={sub.id}
                  className="bg-[#121016] rounded-xl border border-amber-600/40 p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sub.accentColor }}
                          />
                          <h4 className="text-base font-bold text-white">{sub.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>{sub.category}</span>
                          <span>·</span>
                          <span>{sub.familyMember}</span>
                          <span>·</span>
                          <span className="font-mono text-amber-400 font-bold">
                            Usage: {sub.usage}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-white font-mono tabular-nums">
                          {formatCurrency(sub.cost, currency)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatCurrency(annual, currency)} / yr
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 leading-relaxed">
                      <strong>Audit Reason:</strong>{' '}
                      {sub.zombieReason || 'Marked as Low usage. Inactivity or trial conversion detected.'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleZombie(sub.id)}
                      className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      Mark as Essential
                    </button>

                    <button
                      onClick={() => onOpenCancelAssistant(sub)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/60 transition-colors shadow-sm"
                    >
                      <span>Cancel Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
