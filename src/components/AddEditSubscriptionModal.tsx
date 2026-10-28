import React, { useState, useEffect } from 'react';
import { Subscription, Category, BillingCycle, FamilyMember, UsageLevel } from '../types';
import { PRESET_SERVICES } from '../data/mockSubscriptions';
import { X, Sparkles, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

interface AddEditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: Omit<Subscription, 'id'>, existingId?: string) => void;
  editingSubscription?: Subscription | null;
  currency: 'USD' | 'EUR' | 'GBP';
}

const CATEGORIES: Category[] = [
  'Streaming & Media',
  'Productivity & SaaS',
  'AI & Tech',
  'Developer & Cloud',
  'Health & Fitness',
  'Utilities & Security',
  'Lifestyle & News',
];

const FAMILY_MEMBERS: FamilyMember[] = [
  'Shared Family',
  'Alex (Parent)',
  'Jordan (Parent)',
  'Leo (Teen)',
  'Work / Office',
];

export const AddEditSubscriptionModal: React.FC<AddEditSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubscription,
  currency,
}) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<Category>('Streaming & Media');
  const [familyMember, setFamilyMember] = useState<FamilyMember>('Shared Family');
  const [usage, setUsage] = useState<UsageLevel>('High');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Apple Pay · 4821');
  const [accentColor, setAccentColor] = useState('#00E5FF');
  const [cancelUrl, setCancelUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isZombie, setIsZombie] = useState(false);
  const [zombieReason, setZombieReason] = useState('');

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setCost(editingSubscription.cost.toString());
      setBillingCycle(editingSubscription.billingCycle);
      setCategory(editingSubscription.category);
      setFamilyMember(editingSubscription.familyMember);
      setUsage(editingSubscription.usage || 'Medium');
      setNextRenewalDate(editingSubscription.nextRenewalDate);
      setPaymentMethod(editingSubscription.paymentMethod);
      setAccentColor(editingSubscription.accentColor || '#00E5FF');
      setCancelUrl(editingSubscription.cancelUrl || '');
      setNotes(editingSubscription.notes || '');
      setIsZombie(editingSubscription.isZombie);
      setZombieReason(editingSubscription.zombieReason || '');
    } else {
      // Default new entry
      setName('');
      setCost('');
      setBillingCycle('monthly');
      setCategory('Streaming & Media');
      setFamilyMember('Shared Family');
      setUsage('Medium');
      // Default to 14 days from 2026-10-28
      setNextRenewalDate('2026-11-15');
      setPaymentMethod('Apple Pay · 4821');
      setAccentColor('#00E5FF');
      setCancelUrl('');
      setNotes('');
      setIsZombie(false);
      setZombieReason('');
    }
  }, [editingSubscription, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_SERVICES[0]) => {
    setName(preset.name);
    setCost(preset.cost.toString());
    setBillingCycle(preset.cycle);
    setCategory(preset.category);
    setUsage(preset.usage);
    setAccentColor(preset.color);
    setCancelUrl(preset.cancelUrl || '');
    if (preset.usage === 'Low') {
      setIsZombie(true);
      setZombieReason('Low usage preset flagged for periodic audit.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const numericCost = parseFloat(cost) || 0;

    onSave(
      {
        name: name.trim(),
        cost: numericCost,
        currency,
        billingCycle,
        category,
        familyMember,
        usage,
        nextRenewalDate: nextRenewalDate || '2026-11-15',
        paymentMethod: paymentMethod.trim() || 'Credit Card',
        accentColor,
        cancelUrl: cancelUrl.trim(),
        notes: notes.trim(),
        isZombie: isZombie || usage === 'Low',
        zombieReason: isZombie ? zombieReason.trim() : usage === 'Low' ? 'Flagged due to Low reported usage' : undefined,
      },
      editingSubscription ? editingSubscription.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0C111C] rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-7 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {editingSubscription ? 'Edit Subscription' : 'Track New Subscription'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add recurring fee details to monitor household burn rate and upcoming renewals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets (Only when adding) */}
        {!editingSubscription && (
          <div className="pt-4 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              ⚡ Quick Popular Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SERVICES.slice(0, 6).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Service Name & Accent Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Service Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Netflix, ChatGPT Plus, Figma..."
                className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700 p-0.5"
                />
                <span className="font-mono text-slate-400">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Cost & Billing Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Cost ({currency}) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="19.99"
                  className="w-full bg-[#141B2B] text-white pl-8 pr-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Billing Frequency</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 capitalize"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly (Annual)</option>
                <option value="quarterly">Quarterly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Category & Family Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Assigned Family Member</label>
              <select
                value={familyMember}
                onChange={(e) => setFamilyMember(e.target.value as FamilyMember)}
                className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {FAMILY_MEMBERS.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Usage Field (Requested Feature!) & Next Renewal Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold">Reported Usage Level *</label>
                {usage === 'Low' && (
                  <span className="text-[10px] text-amber-400 font-semibold">Flags as Potential Zombie</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141B2B] rounded-lg border border-slate-700">
                {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setUsage(lvl);
                      if (lvl === 'Low') {
                        setIsZombie(true);
                        if (!zombieReason) setZombieReason('Marked as Low usage by user.');
                      }
                    }}
                    className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                      usage === lvl
                        ? lvl === 'Low'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 shadow-sm'
                          : lvl === 'High'
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 shadow-sm'
                          : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Next Renewal Date *</label>
              <input
                type="date"
                required
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* Payment Method & Cancel URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Payment Method</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. Apple Pay · 4821, Amex · 9012"
                className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Direct Cancel Page URL</label>
              <input
                type="url"
                value={cancelUrl}
                onChange={(e) => setCancelUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Zombie Flag & Reason */}
          <div className="pt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isZombie}
                onChange={(e) => setIsZombie(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-400"
              />
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Flag as "Zombie" Subscription
              </span>
            </label>

            {isZombie && (
              <div className="pt-1">
                <input
                  type="text"
                  value={zombieReason}
                  onChange={(e) => setZombieReason(e.target.value)}
                  placeholder="Reason (e.g. Unused free trial, duplicate video streaming, no activity for 30+ days)"
                  className="w-full bg-[#141B2B] text-white px-3 py-1.5 rounded-lg border border-amber-600/40 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Notes / Purpose</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Keep for Champions League; review after November"
              className="w-full bg-[#141B2B] text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg shadow-md transition-all hover:scale-[1.01]"
            >
              {editingSubscription ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
