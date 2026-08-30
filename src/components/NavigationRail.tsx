import React from 'react';
import {
  Home,
  Play,
  Grid,
  Layers,
  Calendar,
  Sparkles,
  Bookmark,
  Trophy,
  BarChart2,
  Users,
  User,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { ProfileRecord } from '../types';

export type ActiveTab = 
  | 'home'
  | 'play'
  | 'levels'
  | 'categories'
  | 'daily'
  | 'special_modes'
  | 'collection'
  | 'achievements'
  | 'statistics'
  | 'family_scores'
  | 'family_night'
  | 'profile'
  | 'settings'
  | 'admin';

interface NavigationRailProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProfile: ProfileRecord;
  onOpenProfilePicker: () => void;
  hintBalance: number;
  isUnlimitedHints: boolean;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  setActiveTab,
  activeProfile,
  onOpenProfilePicker,
  hintBalance,
  isUnlimitedHints
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'play', label: 'Play', icon: <Play className="w-5 h-5" /> },
    { id: 'levels', label: 'Levels', icon: <Grid className="w-5 h-5" /> },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-5 h-5" /> },
    { id: 'daily', label: 'Challenges', icon: <Calendar className="w-5 h-5" /> },
    { id: 'special_modes', label: 'Modes', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'family_night', label: 'Game Night', icon: <Users className="w-5 h-5 text-amber-400" /> },
    { id: 'collection', label: 'Album', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'achievements', label: 'Badges', icon: <Trophy className="w-5 h-5" /> },
    { id: 'statistics', label: 'Stats', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'family_scores', label: 'Family Rank', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Landscape Tablet Left Rail */}
      <aside 
        id="tablet-navigation-rail"
        className="hidden md:flex flex-col w-64 bg-slate-900/95 backdrop-blur border-r border-slate-800 shrink-0 h-screen sticky top-0 z-40 select-none"
      >
        {/* App Branding */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-xl">
            LQ
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-extrabold text-base text-white tracking-tight leading-tight truncate">
              Family Logo Quiz
            </h1>
            <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Free Family Play
            </p>
          </div>
        </div>

        {/* Active Profile Pill */}
        <div className="p-3 border-b border-slate-800/60">
          <button
            id="nav-active-profile-button"
            onClick={onOpenProfilePicker}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {activeProfile.avatar}
              </span>
              <div className="truncate">
                <div className="text-xs text-slate-400 font-medium">Playing as</div>
                <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                  {activeProfile.displayName}
                  {activeProfile.isChildFriendly && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded">
                      Kids
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right pl-2">
              <div className="text-[10px] text-slate-400 font-medium">Hints</div>
              <div className="text-xs font-black text-amber-400">
                {isUnlimitedHints ? '∞ Free' : `💡 ${hintBalance}`}
              </div>
            </div>
          </button>
        </div>

        {/* Scrollable Navigation items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.id === 'family_night' && (
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 font-bold px-1.5 py-0.5 rounded-full">
                    Party
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin mode access link in footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <button
            id="nav-admin-button"
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[44px] ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Administrator Suite</span>
          </button>
        </div>
      </aside>

      {/* Portrait Tablet / Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm">
            LQ
          </div>
          <span className="font-display font-extrabold text-white text-base">
            Family Logo Quiz
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="mobile-profile-btn"
            onClick={onOpenProfilePicker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white"
          >
            <span>{activeProfile.avatar}</span>
            <span className="max-w-[70px] truncate">{activeProfile.displayName}</span>
          </button>
          <button
            id="mobile-admin-btn"
            onClick={() => setActiveTab('admin')}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Admin"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Portrait Tablet / Mobile Bottom Bar */}
      <div 
        id="mobile-bottom-navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 flex items-center justify-around z-40"
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] min-w-[54px] min-h-[48px] justify-center ${
            activeTab === 'home' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          Home
        </button>
        <button
          onClick={() => setActiveTab('play')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] min-w-[54px] min-h-[48px] justify-center ${
            activeTab === 'play' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Play className="w-5 h-5 mb-0.5" />
          Play
        </button>
        <button
          onClick={() => setActiveTab('levels')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] min-w-[54px] min-h-[48px] justify-center ${
            activeTab === 'levels' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          Levels
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] min-w-[54px] min-h-[48px] justify-center ${
            activeTab === 'daily' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          Daily
        </button>
        <button
          onClick={() => setActiveTab('family_night')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] min-w-[54px] min-h-[48px] justify-center ${
            activeTab === 'family_night' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5 text-amber-400" />
          Party
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] min-w-[54px] min-h-[48px] justify-center ${
            activeTab === 'settings' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          Settings
        </button>
      </div>
    </>
  );
};
