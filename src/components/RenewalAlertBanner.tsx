import React from 'react';
import { Subscription } from '../types';
import { getDaysUntilRenewal, getRenewalAlertBadge, formatCurrency } from '../utils/formatters';
import { Clock, ExternalLink, ShieldCheck, X } from 'lucide-react';

interface RenewalAlertBannerProps {
  urgentSubscriptions: Subscription[];
  currency: 'USD' | 'EUR' | 'GBP';
  onOpenCancelAssistant: (sub: Subscription) => void;
  onDismiss: () => void;
  isDismissed: boolean;
}

export const RenewalAlertBanner: React.FC<RenewalAlertBannerProps> = ({
  urgentSubscriptions,
  currency,
  onOpenCancelAssistant,
  onDismiss,
  isDismissed,
}) => {
  if (urgentSubscriptions.length === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="relative rounded-xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-amber-950/40 border border-cyan-500/40 p-4 sm:p-5 shadow-lg shadow-cyan-950/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Renewal Alert Window: {urgentSubscriptions.length} Charges Approaching within 72 Hours
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Review these services before auto-charge executes. Cancel or downgrade now to avoid the next billing cycle.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Dismiss notification"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mini alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3.5">
        {urgentSubscriptions.map((sub) => {
          const days = getDaysUntilRenewal(sub.nextRenewalDate);
          const badge = getRenewalAlertBadge(days);

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-xs sm:text-sm truncate">
                    {sub.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs mt-1 text-slate-400">
                  <span className="font-mono tabular-nums text-slate-200 font-bold">
                    {formatCurrency(sub.cost, currency)}
                  </span>
                  <span>·</span>
                  <span
                    className={`font-semibold text-[11px] ${
                      days <= 1 ? 'text-amber-400 font-mono' : 'text-cyan-300 font-mono'
                    }`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onOpenCancelAssistant(sub)}
                  className="px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/40 rounded transition-colors whitespace-nowrap"
                  title="Check cancel steps or cancel link"
                >
                  Cancel Guide
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
