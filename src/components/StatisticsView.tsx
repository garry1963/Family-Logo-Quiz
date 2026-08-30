import React from 'react';
import { BarChart2, CheckCircle2, Flame, HelpCircle, Trophy, Award, Zap, PieChart } from 'lucide-react';
import { ProfileRecord, LogoRecord, CategoryRecord } from '../types';
import { storage } from '../services/storageService';

interface StatisticsViewProps {
  activeProfile: ProfileRecord;
  logos: LogoRecord[];
  categories: CategoryRecord[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  activeProfile,
  logos,
  categories
}) => {
  const db = storage.getDatabase();
  const progressMap = db.progress[activeProfile.profileId] || {};
  const dailyResults = db.dailyResults[activeProfile.profileId] || {};
  const { currentStreak, bestStreak } = storage.calculateStreak(activeProfile.profileId);

  const progressList = Object.values(progressMap);
  const solvedList = progressList.filter(p => p.solved);
  const totalSolved = solvedList.length;
  const totalAttempts = progressList.reduce((acc, p) => acc + (p.attempts || 1), 0);
  const totalHintsUsed = progressList.reduce((acc, p) => acc + (p.hintsUsed || 0), 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 100;
  const totalPoints = db.gamePoints[activeProfile.profileId] || 0;

  // By Difficulty
  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert', 'Nightmare'] as const;
  const diffStats = difficulties.map(diff => {
    const diffLogos = logos.filter(l => l.difficulty === diff && l.active !== false);
    const solvedInDiff = diffLogos.filter(l => progressMap[l.logoId]?.solved).length;
    return {
      name: diff,
      solved: solvedInDiff,
      total: diffLogos.length,
      pct: diffLogos.length > 0 ? Math.round((solvedInDiff / diffLogos.length) * 100) : 0
    };
  });

  return (
    <div id="statistics-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
          <BarChart2 className="w-7 h-7 text-blue-400" />
          Player & Family Statistics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed metrics, accuracy analysis, and category completion for {activeProfile.displayName}.
        </p>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Total Solved
          </div>
          <div className="font-display font-black text-3xl text-white">
            {totalSolved}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across all 52 levels & modes
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <Zap className="w-4 h-4 text-blue-400" />
            Solve Accuracy
          </div>
          <div className="font-display font-black text-3xl text-emerald-400">
            {accuracy}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalAttempts} total puzzle attempts
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            Daily Streak
          </div>
          <div className="font-display font-black text-3xl text-amber-400">
            {currentStreak} <span className="text-sm text-slate-400 font-normal">Days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Best streak: {bestStreak} Days
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Hints Used
          </div>
          <div className="font-display font-black text-3xl text-purple-400">
            {totalHintsUsed}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Family Points: {totalPoints}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="font-display font-black text-xl text-white mb-4">
          Difficulty Progression
        </h3>
        <div className="space-y-4">
          {diffStats.map(diff => (
            <div key={diff.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white">{diff.name} Difficulty</span>
                <span className="text-slate-400">{diff.solved} / {diff.total} ({diff.pct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${diff.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Progress Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="font-display font-black text-xl text-white mb-4">
          Top Category Solves
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.slice(0, 9).map(cat => {
            const catLogos = logos.filter(l => l.categoryId === cat.categoryId && l.active !== false);
            const catSolved = catLogos.filter(l => progressMap[l.logoId]?.solved).length;
            const pct = catLogos.length > 0 ? Math.round((catSolved / catLogos.length) * 100) : 0;

            return (
              <div key={cat.categoryId} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span>{cat.iconEmoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
