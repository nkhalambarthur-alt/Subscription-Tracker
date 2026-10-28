import React from 'react';
import { Subscription, UsageLevel, Category } from '../types';
import {
  formatCurrency,
  getDaysUntilRenewal,
  getRenewalAlertBadge,
  normalizeMonthlyCost,
  normalizeAnnualCost,
} from '../utils/formatters';
import {
  Calendar,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2,
  CreditCard,
  User,
  Activity,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  currency: 'USD' | 'EUR' | 'GBP';
  onToggleZombie: (id: string) => void;
  onUpdateUsage: (id: string, usage: UsageLevel) => void;
  onUpdateCategory: (id: string, category: Category) => void;
  onOpenCancelAssistant: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

const ALL_CATEGORIES: Category[] = [
  'Streaming & Media',
  'Productivity & SaaS',
  'AI & Tech',
  'Developer & Cloud',
  'Health & Fitness',
  'Utilities & Security',
  'Lifestyle & News',
];

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  currency,
  onToggleZombie,
  onUpdateUsage,
  onUpdateCategory,
  onOpenCancelAssistant,
  onEdit,
  onDelete,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
  const daysUntilRenewal = getDaysUntilRenewal(subscription.nextRenewalDate);
  const renewalBadge = getRenewalAlertBadge(daysUntilRenewal);
  const monthlyCost = normalizeMonthlyCost(subscription.cost, subscription.billingCycle);
  const annualCost = normalizeAnnualCost(subscription.cost, subscription.billingCycle);

  const isRenewingWithin3Days = daysUntilRenewal >= 0 && daysUntilRenewal <= 3;
  const isLowUsage = subscription.usage === 'Low';

  // Format initials for avatar/logo badge
  const initials = subscription.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative rounded-xl transition-all duration-200 border p-5 flex flex-col justify-between ${
        subscription.isZombie
          ? 'bg-[#151218]/90 border-amber-600/50 shadow-lg shadow-amber-950/20'
          : isLowUsage
          ? 'bg-[#121622]/95 border-amber-500/40 shadow-md shadow-slate-950/40'
          : isRenewingWithin3Days
          ? 'bg-[#0E1524]/95 border-cyan-500/50 shadow-lg shadow-cyan-950/30'
          : 'bg-[#0F1420]/80 hover:bg-[#131929]/90 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top row: Brand & Primary Cost & Urgent Renewal Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Color Accent Monogram */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm tracking-wider font-mono text-white shrink-0 shadow-inner border border-white/10"
              style={{
                backgroundColor: subscription.accentColor || '#38BDF8',
              }}
            >
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate">
                {subscription.name}
              </h3>

              {/* Clean unboxed metadata with interactive Category Assign Dropdown */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-1">
                {/* Category with quick assignment selector */}
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-300 font-medium transition-colors hover:underline underline-offset-2"
                    title="Click to change category"
                  >
                    <span>{subscription.category}</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>

                  {isCategoryDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      />
                      <div className="absolute left-0 mt-1 z-30 w-48 bg-[#0F172A] border border-slate-700 rounded-lg shadow-xl py-1 text-left">
                        <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          Assign Category
                        </div>
                        {ALL_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              onUpdateCategory(subscription.id, cat);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors ${
                              subscription.category === cat
                                ? 'text-cyan-400 font-semibold bg-cyan-950/40'
                                : 'text-slate-300'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{subscription.familyMember}</span>
              </div>
            </div>
          </div>

          {/* Cost display */}
          <div className="text-right shrink-0">
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(subscription.cost, currency)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono capitalize">
              {subscription.billingCycle === 'monthly' ? (
                `per month`
              ) : (
                <>
                  {subscription.billingCycle} · <span className="text-slate-300 font-bold">{formatCurrency(monthlyCost, currency)}/mo</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicators & Alerts Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2.5">
          {/* Days until renewal with high-contrast badge */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-300">
              Renewal: <span className="text-slate-400 font-mono">{subscription.nextRenewalDate}</span>
            </span>

            {/* Visual badge for renewals */}
            {isRenewingWithin3Days ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight bg-cyan-950 text-cyan-300 border border-cyan-400/80 animate-pulse">
                <Flame className="w-3 h-3 text-cyan-400" />
                {renewalBadge.label}
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-400">
                ({daysUntilRenewal > 0 ? `${daysUntilRenewal}d away` : 'today'})
              </span>
            )}
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <CreditCard className="w-3 h-3 text-slate-500" />
            <span>{subscription.paymentMethod}</span>
          </div>
        </div>

        {/* Usage Level Bar & Visual Flagging */}
        <div className="mt-3.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">Reported Usage:</span>
            
            {/* Visual Flag for Low Usage */}
            {isLowUsage && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-500/70">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Low Usage Alert
              </span>
            )}
          </div>

          {/* Interactive Usage Selector */}
          <div className="flex items-center gap-1">
            {(['Low', 'Medium', 'High'] as const).map((level) => {
              const isCurrent = subscription.usage === level;
              return (
                <button
                  key={level}
                  onClick={() => onUpdateUsage(subscription.id, level)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                    isCurrent
                      ? level === 'Low'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60'
                        : level === 'High'
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60'
                        : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-transparent'
                  }`}
                  title={`Set usage to ${level}`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zombie Charge Callout Box */}
        {subscription.isZombie && (
          <div className="mt-3 p-3 rounded-lg bg-amber-950/30 border border-amber-600/40 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Zombie Subscription Detected</span>
            </div>
            <p className="text-amber-200/80 mt-1 leading-relaxed text-[11px]">
              {subscription.zombieReason || 'Marked as under-utilized. Recommended for cancellation.'}
            </p>
          </div>
        )}

        {/* Notes (if any and not zombie) */}
        {!subscription.isZombie && subscription.notes && (
          <p className="mt-2 text-xs text-slate-400 line-clamp-1 italic">
            "{subscription.notes}"
          </p>
        )}
      </div>

      {/* Card Footer: Quick Actions */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        {/* Toggle Zombie Status */}
        <button
          onClick={() => onToggleZombie(subscription.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
            subscription.isZombie
              ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-700/40'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
          title={subscription.isZombie ? 'Mark as Essential' : 'Flag as Zombie Charge'}
        >
          {subscription.isZombie ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Essential</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flag Zombie</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {/* Cancel Assistant Guide button */}
          <button
            onClick={() => onOpenCancelAssistant(subscription)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/50 transition-colors"
            title="Open step-by-step cancel instructions"
          >
            <span>Cancel Guide</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(subscription)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Edit subscription"
            aria-label="Edit subscription"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(subscription.id)}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            title="Remove subscription"
            aria-label="Delete subscription"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
