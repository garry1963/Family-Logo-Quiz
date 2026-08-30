import React from 'react';
import { Trophy, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react';
import { AchievementRecord, ProfileRecord, LogoRecord } from '../types';
import { DEFAULT_ACHIEVEMENTS } from '../data/defaultAchievements';
import { storage } from '../services/storageService';

interface AchievementsViewProps {
  activeProfile: ProfileRecord;
  logos: LogoRecord[];
}

const ICON_MAP: Record<string, string> = {
  Sparkles: '✨',
  Compass: '🧭',
  Heart: '❤️',
  Award: '🎖️',
  Crown: '👑',
  Eye: '👁️',
  Zap: '⚡',
  Calendar: '📅',
  Flame: '🔥',
  Utensils: '🍔',
  Palette: '🎨',
  History: '📜',
  Quote: '💬',
  Layers: '📐',
  Trophy: '🏆'
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  activeProfile,
  logos
}) => {
  const unlockedMap = storage.getDatabase().unlockedAchievements[activeProfile.profileId] || {};
  const progressMap = storage.getDatabase().progress[activeProfile.profileId] || {};
  const solvedCount = Object.values(progressMap).filter(p => p.solved).length;
  const { currentStreak, bestStreak } = storage.calculateStreak(activeProfile.profileId);
  const dailyCount = Object.keys(storage.getDatabase().dailyResults[activeProfile.profileId] || {}).length;

  const totalCount = DEFAULT_ACHIEVEMENTS.length;
  const unlockedCount = Object.keys(unlockedMap).length;

  return (
    <div id="achievements-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            Family Achievements & Badges
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unlock trophies across puzzle solving, special modes, and daily streaks!
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-sm">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span>{unlockedCount} of {totalCount} Badges Unlocked</span>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEFAULT_ACHIEVEMENTS.map(ach => {
          const isUnlocked = !!unlockedMap[ach.achievementId];
          const unlockDate = unlockedMap[ach.achievementId];

          // Compute progress toward badge
          let currentVal = 0;
          if (['first_logo', 'getting_started', 'logo_fan', 'brand_expert', 'logo_master'].includes(ach.achievementId)) {
            currentVal = solvedCount;
          } else if (ach.achievementId === 'daily_player') {
            currentVal = dailyCount;
          } else if (ach.achievementId === 'streak_master') {
            currentVal = Math.max(currentStreak, bestStreak);
          } else if (ach.achievementId === 'food_drink_pro') {
            currentVal = Object.values(progressMap).filter(p => p.solved && p.gameMode === 'food_drink').length;
          } else if (ach.achievementId === 'color_detective') {
            currentVal = Object.values(progressMap).filter(p => p.solved && p.gameMode === 'guess_colour').length;
          } else if (ach.achievementId === 'retro_historian') {
            currentVal = Object.values(progressMap).filter(p => p.solved && p.gameMode === 'retro').length;
          } else if (ach.achievementId === 'slogan_scholar') {
            currentVal = Object.values(progressMap).filter(p => p.solved && p.gameMode === 'slogan').length;
          } else if (ach.achievementId === 'minimalist_vision') {
            currentVal = Object.values(progressMap).filter(p => p.solved && p.gameMode === 'minimalist').length;
          }

          const progressPct = Math.min(100, Math.round((currentVal / ach.target) * 100));

          return (
            <div
              key={ach.achievementId}
              id={`achievement-card-${ach.achievementId}`}
              className={`p-5 rounded-3xl border transition-all select-none flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl p-2 bg-slate-800 rounded-2xl border border-slate-700">
                    {ICON_MAP[ach.icon] || '⭐'}
                  </span>
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="font-display font-black text-lg text-white mb-1">
                  {ach.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {/* Progress bar and metadata */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">{Math.min(ach.target, currentVal)} / {ach.target}</span>
                  <span className="text-amber-400">{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-amber-400' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {isUnlocked && unlockDate && (
                  <div className="text-[10px] text-slate-500 text-right pt-0.5">
                    Unlocked on {new Date(unlockDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
