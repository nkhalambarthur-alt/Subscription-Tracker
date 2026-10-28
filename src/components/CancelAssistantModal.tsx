import React from 'react';
import { Subscription } from '../types';
import { formatCurrency, normalizeAnnualCost, normalizeMonthlyCost } from '../utils/formatters';
import { X, ExternalLink, ShieldAlert, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';

interface CancelAssistantModalProps {
  subscription: Subscription | null;
  currency: 'USD' | 'EUR' | 'GBP';
  onClose: () => void;
  onConfirmCancel: (id: string) => void;
}

export const CancelAssistantModal: React.FC<CancelAssistantModalProps> = ({
  subscription,
  currency,
  onClose,
  onConfirmCancel,
}) => {
  if (!subscription) return null;

  const monthlyCost = normalizeMonthlyCost(subscription.cost, subscription.billingCycle);
  const annualCost = normalizeAnnualCost(subscription.cost, subscription.billingCycle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0C111C] rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-7 text-left">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Cancellation & Retention Shield
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Cancel {subscription.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Savings Highlight */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40">
          <div className="text-xs text-emerald-300 font-medium">Potential Instant Savings:</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {formatCurrency(annualCost, currency)}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              / year ({formatCurrency(monthlyCost, currency)} / mo)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Canceling this recurring charge frees up monthly household liquidity immediately.
          </p>
        </div>

        {/* Reason / Context */}
        {subscription.zombieReason && (
          <div className="mt-3.5 p-3 rounded-lg bg-amber-950/30 border border-amber-600/30 text-xs text-amber-300">
            <strong>Zombie Flag Note:</strong> {subscription.zombieReason}
          </div>
        )}

        {/* Cancellation Steps Checklist */}
        <div className="mt-4 space-y-2.5 text-xs text-slate-300">
          <div className="font-semibold text-white uppercase font-mono tracking-wider text-[11px]">
            ⚡ Smart Cancellation Checklist:
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Direct Account Settings:</span> Click the button below to reach the official billing portal without navigating dark patterns.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Decline 'Pause' offers:</span> Providers often offer a 1-month pause that silently resumes billing next month. Choose permanent cancellation.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Service remains active until {subscription.nextRenewalDate}:</span> You will not lose access immediately; your prepaid period remains valid.
            </div>
          </div>
        </div>

        {/* Direct Link */}
        {subscription.cancelUrl ? (
          <div className="mt-5">
            <a
              href={subscription.cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-colors"
            >
              <span>Open {subscription.name} Account Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="mt-5 text-center text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            Open the provider's mobile app or website profile settings to complete cancellation.
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Keep Subscription
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmCancel(subscription.id);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/40 transition-colors"
          >
            <span>Confirm Canceled (Remove Fee)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
