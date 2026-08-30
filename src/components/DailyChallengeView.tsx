import React, { useState } from 'react';
import { Calendar, Flame, CheckCircle2, Trophy, Zap, ChevronLeft, ChevronRight, Award, Lock } from 'lucide-react';
import { DailyChallengeRecord, ProfileRecord, LogoRecord } from '../types';
import { getTodayDateString, getMonthDates, getDailyChallengeForDate } from '../data/dailyChallenges';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

interface DailyChallengeViewProps {
  activeProfile: ProfileRecord;
  logos: LogoRecord[];
  onPlayDaily: (challenge: DailyChallengeRecord) => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  activeProfile,
  logos,
  onPlayDaily
}) => {
  const todayStr = getTodayDateString();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const todayChallenge = getDailyChallengeForDate(todayStr, logos);
  const dailyResults = storage.getDatabase().dailyResults[activeProfile.profileId] || {};
  const isTodayCompleted = !!dailyResults[todayStr];
  const { currentStreak, bestStreak } = storage.calculateStreak(activeProfile.profileId);

  const monthDates = getMonthDates(selectedYear, selectedMonth);
  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div id="daily-challenge-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-amber-400" />
            Daily Challenge & Streaks
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Solve a new 5-logo set every day to build your streak and earn free bonus gameplay hints!
          </p>
        </div>

        {/* Streak Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-sm">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>{currentStreak} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Best: {bestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Today's Hero Banner Card */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-wider border border-amber-500/30">
              Today's Challenge
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {todayChallenge.difficulty} Difficulty · 5 Logos
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {todayChallenge.title}
          </h2>
          <p className="text-sm text-slate-300">
            {todayChallenge.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2">
            <span className="text-amber-400">🎁 Reward: +3 Free Hints</span>
            <span className="text-blue-400">⭐ +50 Family Points</span>
          </div>
        </div>

        <div className="shrink-0">
          <button
            id="play-daily-hero-btn"
            onClick={() => {
              sound.playTap();
              onPlayDaily(todayChallenge);
            }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-extrabold text-base transition-all min-h-[54px] shadow-lg ${
              isTodayCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isTodayCompleted ? (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Replay Completed Challenge</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>PLAY TODAY'S PUZZLE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 30-Day Streak Calendar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h3 className="font-display font-black text-xl text-white">
            {monthName} Calendar
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playTap();
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                sound.playTap();
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-500 py-1 uppercase">
              {d}
            </div>
          ))}

          {monthDates.map(dateStr => {
            const dateNum = parseInt(dateStr.split('-')[2], 10);
            const isCompleted = !!dailyResults[dateStr];
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;

            return (
              <div
                key={dateStr}
                id={`calendar-cell-${dateStr}`}
                onClick={() => {
                  if (!isFuture) {
                    sound.playTap();
                    const challenge = getDailyChallengeForDate(dateStr, logos);
                    onPlayDaily(challenge);
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center min-h-[64px] sm:min-h-[80px] select-none ${
                  isFuture
                    ? 'bg-slate-900/30 border-slate-800/40 text-slate-600 cursor-not-allowed'
                    : isToday
                    ? 'bg-amber-950/30 border-amber-500 text-amber-300 shadow-md ring-2 ring-amber-500/20 cursor-pointer hover:scale-105'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 cursor-pointer hover:scale-105'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 cursor-pointer hover:scale-105'
                }`}
              >
                <span className="font-display font-black text-sm sm:text-base">
                  {dateNum}
                </span>

                <div className="mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isToday ? (
                    <span className="text-[10px] font-extrabold uppercase text-amber-400">
                      Today
                    </span>
                  ) : isFuture ? (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <span className="text-[10px] text-slate-500">Play</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
