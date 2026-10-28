/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Subscription, ViewTab, UsageLevel, Category, FamilyMember } from './types';
import { INITIAL_SUBSCRIPTIONS } from './data/mockSubscriptions';
import { calculateBurnRate, getDaysUntilRenewal } from './utils/formatters';
import { TopBar } from './components/TopBar';
import { BurnRateHeader } from './components/BurnRateHeader';
import { RenewalAlertBanner } from './components/RenewalAlertBanner';
import { SubscriptionList } from './components/SubscriptionList';
import { ZombieAuditView } from './components/ZombieAuditView';
import { TimelineView } from './components/TimelineView';
import { FamilySpendBreakdown } from './components/FamilySpendBreakdown';
import { AddEditSubscriptionModal } from './components/AddEditSubscriptionModal';
import { CancelAssistantModal } from './components/CancelAssistantModal';
import { RotateCcw, Download, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'substack_subscriptions_v2';
const CURRENCY_KEY = 'substack_currency';

export default function App() {
  // Subscriptions state initialized with local storage or rich presets
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>(() => {
    try {
      const stored = localStorage.getItem(CURRENCY_KEY);
      if (stored === 'EUR' || stored === 'GBP' || stored === 'USD') {
        return stored;
      }
    } catch (e) {}
    return 'USD';
  });

  // Current active navigation view
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Filter triggers
  const [isZombieFilterActive, setIsZombieFilterActive] = useState(false);
  const [isRenewingFilterActive, setIsRenewingFilterActive] = useState(false);
  const [isAlertBannerDismissed, setIsAlertBannerDismissed] = useState(false);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [cancelModalSub, setCancelModalSub] = useState<Subscription | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('Failed to save subscriptions', e);
    }
  }, [subscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch (e) {}
  }, [currency]);

  // Derived Burn Rate Calculations
  const summary = useMemo(() => calculateBurnRate(subscriptions), [subscriptions]);

  // Subscriptions renewing within next 3 days (0 to 3 days)
  const urgentRenewals = useMemo(() => {
    return subscriptions.filter((s) => {
      if (s.isPaused) return false;
      const days = getDaysUntilRenewal(s.nextRenewalDate);
      return days >= 0 && days <= 3;
    });
  }, [subscriptions]);

  // Toggle Zombie status
  const handleToggleZombie = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              isZombie: !sub.isZombie,
              zombieReason: !sub.isZombie
                ? sub.zombieReason || 'Manually flagged as zombie fee by household'
                : undefined,
            }
          : sub
      )
    );
  };

  // Update Usage Level
  const handleUpdateUsage = (id: string, usage: UsageLevel) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              usage,
              // If marked Low, recommend zombie flag
              isZombie: usage === 'Low' ? true : sub.isZombie,
              zombieReason:
                usage === 'Low' && !sub.zombieReason
                  ? 'Flagged due to Low reported usage.'
                  : sub.zombieReason,
            }
          : sub
      )
    );
  };

  // Update Category directly
  const handleUpdateCategory = (id: string, category: Category) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, category } : sub))
    );
  };

  // Delete subscription
  const handleDelete = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  // Confirm cancel (from cancel assistant)
  const handleConfirmCancel = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  // Save (Create / Update) subscription
  const handleSaveSubscription = (
    data: Omit<Subscription, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === existingId ? { ...data, id: existingId } : s))
      );
    } else {
      const newSub: Subscription = {
        ...data,
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      setSubscriptions((prev) => [newSub, ...prev]);
    }
    setEditingSubscription(null);
  };

  // Reset to default sample dataset
  const handleResetSampleData = () => {
    if (window.confirm('Reset all subscriptions to the initial sample dataset?')) {
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      setIsZombieFilterActive(false);
      setIsRenewingFilterActive(false);
      setIsAlertBannerDismissed(false);
    }
  };

  // Export data as JSON file
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `substack-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar with Top Bar Contract */}
      <TopBar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAddClick={() => {
          setEditingSubscription(null);
          setIsAddEditModalOpen(true);
        }}
        zombieCount={summary.zombieCount}
        renewingSoonCount={summary.renewingSoonCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Core Feature 1: Burn Rate Header */}
        <BurnRateHeader
          summary={summary}
          currency={currency}
          onCurrencyChange={setCurrency}
          onFilterZombies={() => {
            if (currentTab !== 'dashboard') setCurrentTab('dashboard');
            setIsZombieFilterActive(!isZombieFilterActive);
            setIsRenewingFilterActive(false);
          }}
          onFilterRenewingSoon={() => {
            if (currentTab !== 'dashboard') setCurrentTab('dashboard');
            setIsRenewingFilterActive(!isRenewingFilterActive);
            setIsZombieFilterActive(false);
          }}
          isZombieFilterActive={isZombieFilterActive}
          isRenewingFilterActive={isRenewingFilterActive}
        />

        {/* Core Feature 4: Renewal Alerts Banner (≤ 3 Days) */}
        {urgentRenewals.length > 0 && (
          <RenewalAlertBanner
            urgentSubscriptions={urgentRenewals}
            currency={currency}
            onOpenCancelAssistant={(sub) => setCancelModalSub(sub)}
            onDismiss={() => setIsAlertBannerDismissed(true)}
            isDismissed={isAlertBannerDismissed}
          />
        )}

        {/* Tab View Routing */}
        {currentTab === 'dashboard' && (
          <SubscriptionList
            subscriptions={subscriptions}
            currency={currency}
            onToggleZombie={handleToggleZombie}
            onUpdateUsage={handleUpdateUsage}
            onUpdateCategory={handleUpdateCategory}
            onOpenCancelAssistant={(sub) => setCancelModalSub(sub)}
            onEdit={(sub) => {
              setEditingSubscription(sub);
              setIsAddEditModalOpen(true);
            }}
            onDelete={handleDelete}
            onAddNew={() => {
              setEditingSubscription(null);
              setIsAddEditModalOpen(true);
            }}
            isZombieFilterActive={isZombieFilterActive}
            setIsZombieFilterActive={setIsZombieFilterActive}
            isRenewingFilterActive={isRenewingFilterActive}
            setIsRenewingFilterActive={setIsRenewingFilterActive}
          />
        )}

        {currentTab === 'zombie_audit' && (
          <ZombieAuditView
            subscriptions={subscriptions}
            currency={currency}
            onToggleZombie={handleToggleZombie}
            onUpdateUsage={handleUpdateUsage}
            onOpenCancelAssistant={(sub) => setCancelModalSub(sub)}
            onEdit={(sub) => {
              setEditingSubscription(sub);
              setIsAddEditModalOpen(true);
            }}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineView
            subscriptions={subscriptions}
            currency={currency}
            onOpenCancelAssistant={(sub) => setCancelModalSub(sub)}
          />
        )}

        {currentTab === 'family_split' && (
          <FamilySpendBreakdown
            subscriptions={subscriptions}
            currency={currency}
            onFilterMember={(member: FamilyMember) => {
              setCurrentTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Footer Utility Actions */}
      <footer className="border-t border-slate-900 bg-[#070A10] px-4 sm:px-8 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">SubStack</span>
            <span>·</span>
            <span>Personal & Household Subscription Intelligence</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleResetSampleData}
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Subscription Modal */}
      <AddEditSubscriptionModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        editingSubscription={editingSubscription}
        currency={currency}
      />

      {/* Cancel Assistant Modal */}
      <CancelAssistantModal
        subscription={cancelModalSub}
        currency={currency}
        onClose={() => setCancelModalSub(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}
