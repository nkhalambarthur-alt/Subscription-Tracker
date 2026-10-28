import React, { useState, useMemo } from 'react';
import { Subscription, SortOption, Category, FamilyMember, UsageLevel } from '../types';
import { SubscriptionCard } from './SubscriptionCard';
import {
  Search,
  ArrowUpDown,
  Filter,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  currency: 'USD' | 'EUR' | 'GBP';
  onToggleZombie: (id: string) => void;
  onUpdateUsage: (id: string, usage: UsageLevel) => void;
  onUpdateCategory: (id: string, category: Category) => void;
  onOpenCancelAssistant: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  isZombieFilterActive: boolean;
  setIsZombieFilterActive: (active: boolean) => void;
  isRenewingFilterActive: boolean;
  setIsRenewingFilterActive: (active: boolean) => void;
}

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Streaming & Media',
  'Productivity & SaaS',
  'AI & Tech',
  'Developer & Cloud',
  'Health & Fitness',
  'Utilities & Security',
  'Lifestyle & News',
];

const FAMILY_MEMBERS: ('All' | FamilyMember)[] = [
  'All',
  'Shared Family',
  'Alex (Parent)',
  'Jordan (Parent)',
  'Leo (Teen)',
  'Work / Office',
];

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  currency,
  onToggleZombie,
  onUpdateUsage,
  onUpdateCategory,
  onOpenCancelAssistant,
  onEdit,
  onDelete,
  onAddNew,
  isZombieFilterActive,
  setIsZombieFilterActive,
  isRenewingFilterActive,
  setIsRenewingFilterActive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortOption>('highest_cost');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<'All' | FamilyMember>('All');
  const [onlyLowUsage, setOnlyLowUsage] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter and sort logic
  const filteredAndSortedSubs = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = sub.name.toLowerCase().includes(q);
          const matchNotes = (sub.notes || '').toLowerCase().includes(q);
          const matchCategory = sub.category.toLowerCase().includes(q);
          const matchMember = sub.familyMember.toLowerCase().includes(q);
          if (!matchName && !matchNotes && !matchCategory && !matchMember) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && sub.category !== selectedCategory) {
          return false;
        }

        // Family member filter
        if (selectedFamilyMember !== 'All' && sub.familyMember !== selectedFamilyMember) {
          return false;
        }

        // Low usage filter
        if (onlyLowUsage && sub.usage !== 'Low') {
          return false;
        }

        // Zombie filter
        if (isZombieFilterActive && !sub.isZombie) {
          return false;
        }

        // Renewing soon filter (<= 3 days)
        if (isRenewingFilterActive) {
          const target = new Date(sub.nextRenewalDate + 'T00:00:00');
          const base = new Date('2026-10-28T00:00:00');
          const diffDays = Math.ceil((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < 0 || diffDays > 3) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Smart sorting options:
        if (selectedSort === 'highest_cost') {
          // Normalize to monthly equivalent
          const costA = a.billingCycle === 'yearly' ? a.cost / 12 : a.cost;
          const costB = b.billingCycle === 'yearly' ? b.cost / 12 : b.cost;
          return costB - costA;
        }
        if (selectedSort === 'lowest_cost') {
          const costA = a.billingCycle === 'yearly' ? a.cost / 12 : a.cost;
          const costB = b.billingCycle === 'yearly' ? b.cost / 12 : b.cost;
          return costA - costB;
        }
        if (selectedSort === 'soonest_renewal') {
          return a.nextRenewalDate.localeCompare(b.nextRenewalDate);
        }
        if (selectedSort === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (selectedSort === 'zombie_first') {
          if (a.isZombie && !b.isZombie) return -1;
          if (!a.isZombie && b.isZombie) return 1;
          return 0;
        }
        return 0;
      });
  }, [
    subscriptions,
    searchQuery,
    selectedSort,
    selectedCategory,
    selectedFamilyMember,
    onlyLowUsage,
    isZombieFilterActive,
    isRenewingFilterActive,
  ]);

  const activeFiltersCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedFamilyMember !== 'All' ? 1 : 0) +
    (onlyLowUsage ? 1 : 0) +
    (isZombieFilterActive ? 1 : 0) +
    (isRenewingFilterActive ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFamilyMember('All');
    setOnlyLowUsage(false);
    setIsZombieFilterActive(false);
    setIsRenewingFilterActive(false);
  };

  return (
    <div className="space-y-5">
      {/* Search & Smart Sorting Control Bar */}
      <div className="bg-[#0B0F19] rounded-xl border border-slate-800 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or card..."
              className="w-full bg-[#131926] text-white placeholder-slate-400 pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Smart Sorting Controls: Toggle between "Highest Cost" and "Soonest Renewal" */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              Sort by:
            </span>

            {/* Smart Sort Segmented Switch */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setSelectedSort('highest_cost')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedSort === 'highest_cost'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Highest Cost
              </button>

              <button
                onClick={() => setSelectedSort('soonest_renewal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedSort === 'soonest_renewal'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Soonest Renewal
              </button>

              <button
                onClick={() => setSelectedSort('zombie_first')}
                className={`hidden sm:inline-block px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedSort === 'zombie_first'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Zombies First
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dense table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filter Controls: Categories, Family Members, and Low Usage toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Category Filter bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <span className="text-slate-400 font-medium shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Low Usage Filter Button */}
            <button
              onClick={() => setOnlyLowUsage(!onlyLowUsage)}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border transition-colors ${
                onlyLowUsage
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/80 ring-1 ring-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/80 border-slate-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Low Usage Only</span>
            </button>

            {/* Clear Filters (if active) */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 px-2 py-1 rounded transition-colors"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count & Current Filter Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-white font-mono">{filteredAndSortedSubs.length}</strong> of{' '}
            <span className="font-mono">{subscriptions.length}</span> subscriptions
          </span>
          {isZombieFilterActive && (
            <span className="text-amber-400 font-medium">· Filtered by Zombie charges</span>
          )}
          {isRenewingFilterActive && (
            <span className="text-cyan-400 font-medium">· Filtered by Renewals ≤ 3 days</span>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Sorted: {selectedSort === 'highest_cost' ? 'Highest Monthly Burn' : 'Soonest Renewal Date'}
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedSubs.length === 0 ? (
        <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No subscriptions matched your filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try clearing search terms, adjusting categories, or removing the low-usage / zombie filters.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={onAddNew}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              + Track New Service
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedSubs.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              currency={currency}
              onToggleZombie={onToggleZombie}
              onUpdateUsage={onUpdateUsage}
              onUpdateCategory={onUpdateCategory}
              onOpenCancelAssistant={onOpenCancelAssistant}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* High-Density Tabular View */
        <div className="bg-[#0B0F19] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Usage Level</th>
                  <th className="py-3 px-4">Next Renewal</th>
                  <th className="py-3 px-4">Family Member</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredAndSortedSubs.map((sub) => {
                  const target = new Date(sub.nextRenewalDate + 'T00:00:00');
                  const base = new Date('2026-10-28T00:00:00');
                  const diffDays = Math.ceil((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
                  const isRenewingSoon = diffDays >= 0 && diffDays <= 3;

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        sub.isZombie ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sub.accentColor }}
                          />
                          <span className="truncate max-w-[180px]">{sub.name}</span>
                          {sub.isZombie && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-600/50">
                              Zombie
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{sub.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                            sub.usage === 'Low'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/50'
                              : sub.usage === 'High'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/40'
                              : 'bg-slate-800 text-cyan-300'
                          }`}
                        >
                          {sub.usage}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-slate-300">{sub.nextRenewalDate}</span>{' '}
                        {isRenewingSoon && (
                          <span className="text-cyan-400 font-bold ml-1">
                            ({diffDays === 0 ? 'Today' : `${diffDays}d`})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{sub.familyMember}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-white">
                        ${sub.cost.toFixed(2)}
                        <span className="text-[11px] text-slate-400 font-normal ml-1">
                          /{sub.billingCycle.slice(0, 2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => onOpenCancelAssistant(sub)}
                          className="text-cyan-400 hover:text-cyan-300 font-medium text-xs"
                        >
                          Cancel Guide
                        </button>
                        <button
                          onClick={() => onEdit(sub)}
                          className="text-slate-400 hover:text-slate-200 text-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
