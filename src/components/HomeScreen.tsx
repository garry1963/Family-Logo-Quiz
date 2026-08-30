import React from 'react';
import {
  Play,
  Calendar,
  Sparkles,
  Utensils,
  Palette,
  History,
  Quote,
  Layers,
  Award,
  Users,
  Trophy,
  Flame,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ProfileRecord, LogoRecord, GameMode, DailyChallengeRecord } from '../types';
import { ActiveTab } from './NavigationRail';
import { sound } from '../services/soundEffects';

interface HomeScreenProps {
  activeProfile: ProfileRecord;
  setActiveTab: (tab: ActiveTab) => void;
  onStartClassicPlay: (levelNumber?: number) => void;
  onStartGameMode: (mode: GameMode) => void;
  onStartDailyChallenge: () => void;
  solvedCount: number;
  totalLogosCount: number;
  currentLevelNumber: number;
  currentStreak: number;
  accuracy: number;
  todayChallenge: DailyChallengeRecord;
  isTodayDailyCompleted: boolean;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeProfile,
  setActiveTab,
  onStartClassicPlay,
  onStartGameMode,
  onStartDailyChallenge,
  solvedCount,
  totalLogosCount,
  currentLevelNumber,
  currentStreak,
  accuracy,
  todayChallenge,
  isTodayDailyCompleted,
  unlockedAchievementsCount,
  totalAchievementsCount
}) => {
  const progressPercent = totalLogosCount > 0 ? Math.round((solvedCount / totalLogosCount) * 100) : 0;

  return (
    <div id="home-dashboard" className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Welcome back, {activeProfile.displayName}!
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
            Ready to test your brand memory?
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            100% Free family logo puzzles with zero ads, subscriptions, or paywalls.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            id="home-continue-big-btn"
            onClick={() => {
              sound.playTap();
              onStartClassicPlay(currentLevelNumber);
            }}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 min-h-[54px]"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>CONTINUE PLAYING</span>
          </button>
        </div>
      </div>

      {/* Primary 2-Column Grid: Continue Level vs Daily Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Playing Card */}
        <div 
          id="home-continue-card"
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Play className="w-5 h-5" />
                </span>
                <h3 className="font-display font-extrabold text-lg text-white">
                  Main Campaign · Level {currentLevelNumber}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                52 Levels Total
              </span>
            </div>

            <div className="space-y-3 my-4">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Total Logos Solved</span>
                <span className="text-white font-bold">{solvedCount} / {totalLogosCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('levels')}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Browse all 52 levels →
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onStartClassicPlay(currentLevelNumber);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold border border-slate-700 transition-all"
            >
              Play Level {currentLevelNumber}
            </button>
          </div>
        </div>

        {/* Daily Challenge Card */}
        <div 
          id="home-daily-card"
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">
                    Daily Challenge
                  </h3>
                  <p className="text-xs text-slate-400">{todayChallenge.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{currentStreak} Day Streak</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 my-3">
              Solve today's 5 curated mixed brand puzzles to earn +3 free hints and keep your streak alive!
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('daily')}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              View Streak Calendar →
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onStartDailyChallenge();
              }}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                isTodayDailyCompleted
                  ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              {isTodayDailyCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Completed Today!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Play Today's Challenge
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Family Stats Summary Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Logos Solved</div>
          <div className="font-display font-black text-2xl text-white mt-1">
            {solvedCount}
          </div>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Accuracy</div>
          <div className="font-display font-black text-2xl text-emerald-400 mt-1">
            {accuracy}%
          </div>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
          <div className="font-display font-black text-2xl text-amber-400 mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5" />
            {currentStreak}
          </div>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Achievements</div>
          <div className="font-display font-black text-2xl text-purple-400 mt-1">
            {unlockedAchievementsCount} / {totalAchievementsCount}
          </div>
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-xl text-white tracking-tight">
              Special Game Modes
            </h2>
            <p className="text-xs text-slate-400">
              Exciting ways to play with family and test different brand skills
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Family Game Night Mode (Special) */}
          <div
            onClick={() => {
              sound.playTap();
              setActiveTab('family_night');
            }}
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-600/30 via-slate-900 to-slate-900 border-2 border-amber-500/40 hover:border-amber-400 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors">
                Family Game Night
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                2 to 8 local players turn-based party game with scores and podium!
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-400 mt-3 flex items-center gap-1">
              Start Party →
            </span>
          </div>

          {/* Food & Drink */}
          <div
            onClick={() => {
              sound.playTap();
              onStartGameMode('food_drink');
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-emerald-300 transition-colors">
                Food & Drink Quiz
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Fast food, snacks, candies, sodas and supermarket treats.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 mt-3 flex items-center gap-1">
              Play Mode →
            </span>
          </div>

          {/* Guess the Colour */}
          <div
            onClick={() => {
              sound.playTap();
              onStartGameMode('guess_colour');
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-purple-300 transition-colors">
                Guess the Colour
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Match famous brands to their authentic color schemes.
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-400 mt-3 flex items-center gap-1">
              Play Mode →
            </span>
          </div>

          {/* Retro Logos */}
          <div
            onClick={() => {
              sound.playTap();
              onStartGameMode('retro');
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <History className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors">
                Retro Logos
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Identify companies from their historical vintage designs!
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-400 mt-3 flex items-center gap-1">
              Play Mode →
            </span>
          </div>

          {/* Slogans */}
          <div
            onClick={() => {
              sound.playTap();
              onStartGameMode('slogan');
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Quote className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-indigo-300 transition-colors">
                Famous Slogans
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Identify the brand from its legendary advertising catchphrase.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-400 mt-3 flex items-center gap-1">
              Play Mode →
            </span>
          </div>

          {/* Minimalist Logos */}
          <div
            onClick={() => {
              sound.playTap();
              onStartGameMode('minimalist');
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors">
                Minimalist Logos
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simplified, stripped-back shapes with no text or details.
              </p>
            </div>
            <span className="text-[11px] font-bold text-cyan-400 mt-3 flex items-center gap-1">
              Play Mode →
            </span>
          </div>

          {/* Practice Mode */}
          <div
            onClick={() => {
              sound.playTap();
              onStartGameMode('practice');
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/60 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-teal-300 transition-colors">
                Practice Mode
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Unlimited hints and zero penalties. Replay any logo relaxedly.
              </p>
            </div>
            <span className="text-[11px] font-bold text-teal-400 mt-3 flex items-center gap-1">
              Practice Now →
            </span>
          </div>

          {/* Expert Mode */}
          <div
            onClick={() => {
              sound.playTap();
              onStartGameMode('expert');
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 shadow-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-rose-300 transition-colors">
                Expert Mode
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Challenging, obscure, and tricky logos for seasoned solvers.
              </p>
            </div>
            <span className="text-[11px] font-bold text-rose-400 mt-3 flex items-center gap-1">
              Expert Mode →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
