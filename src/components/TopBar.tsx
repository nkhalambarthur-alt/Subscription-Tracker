import React from 'react';
import { ViewTab } from '../types';
import { Plus, ShieldAlert, Sparkles, Layers } from 'lucide-react';

interface TopBarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onAddClick: () => void;
  zombieCount: number;
  renewingSoonCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onTabChange,
  onAddClick,
  zombieCount,
  renewingSoonCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090D14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/10">
            <Layers className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              SubStack
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
            currentTab === 'dashboard'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('zombie_audit')}
          className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
            currentTab === 'zombie_audit'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <span>Zombie Hunter</span>
          {zombieCount > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {zombieCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('timeline')}
          className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
            currentTab === 'timeline'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <span>Renewal Calendar</span>
          {renewingSoonCount > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {renewingSoonCount} soon
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('family_split')}
          className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
            currentTab === 'family_split'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Family Allocation
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg shadow-md shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Track Subscription</span>
        </button>
      </div>
    </header>
  );
};
