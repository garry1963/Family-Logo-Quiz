import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  CheckCircle2,
  Trophy,
  Zap,
  ChevronLeft,
  ChevronRight,
  Award,
  Lock,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { DailyChallengeRecord, WeeklyChallengeRecord, ProfileRecord, LogoRecord } from '../types';
import {
  getTodayDateString,
  getMonthDates,
  getDailyChallengeForDate,
  getCurrentWeekKey,
  getWeeklyChallengeForWeek,
  getRecentWeekKeys,
  getTimeRemainingInWeek
} from '../data/dailyChallenges';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

interface DailyChallengeViewProps {
  activeProfile: ProfileRecord;
  logos: LogoRecord[];
  onPlayDaily: (challenge: DailyChallengeRecord) => void;
  onPlayWeekly: (challenge: WeeklyChallengeRecord) => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  activeProfile,
  logos,
  onPlayDaily,
  onPlayWeekly
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const todayStr = getTodayDateString();
  const currentWeekKey = getCurrentWeekKey();

  // Daily State
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const todayChallenge = getDailyChallengeForDate(todayStr, logos);
  const dailyResults = storage.getDatabase().dailyResults[activeProfile.profileId] || {};
  const isTodayCompleted = !!dailyResults[todayStr];
  const { currentStreak, bestStreak } = storage.calculateStreak(activeProfile.profileId);
  const monthDates = getMonthDates(selectedYear, selectedMonth);
  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Weekly State
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(currentWeekKey);
  const selectedWeeklyChallenge = getWeeklyChallengeForWeek(selectedWeekKey, logos);
  const currentWeeklyChallenge = getWeeklyChallengeForWeek(currentWeekKey, logos);
  const weeklyResults = storage.getWeeklyResults(activeProfile.profileId);
  const selectedWeeklyResult = weeklyResults[selectedWeekKey];
  const isSelectedWeeklyCompleted = !!selectedWeeklyResult;
  const isCurrentWeeklyCompleted = !!weeklyResults[currentWeekKey];
  const recentWeeks = getRecentWeekKeys(6);
  const timeLeft = getTimeRemainingInWeek();

  return (
    <div id="challenges-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            Special Game Challenges
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
            {activeTab === 'daily' ? (
              <>
                <Calendar className="w-7 h-7 text-amber-400" />
                Daily Challenges & Streaks
              </>
            ) : (
              <>
                <Trophy className="w-7 h-7 text-amber-400" />
                Weekly Mega Challenges
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {activeTab === 'daily'
              ? 'Solve a curated 5-logo set every day to build your streak and earn free bonus hints!'
              : 'Complete the 10-logo themed weekly campaign for massive bonus points and exclusive badges!'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            id="tab-daily-challenges"
            onClick={() => {
              sound.playTap();
              setActiveTab('daily');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[44px] ${
              activeTab === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Challenges</span>
            {currentStreak > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${activeTab === 'daily' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'}`}>
                {currentStreak}🔥
              </span>
            )}
          </button>

          <button
            id="tab-weekly-challenges"
            onClick={() => {
              sound.playTap();
              setActiveTab('weekly');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[44px] ${
              activeTab === 'weekly'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Weekly Challenges</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              10 Logos
            </span>
          </button>
        </div>
      </div>

      {/* ======================= DAILY CHALLENGES SECTION ======================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Daily Streak & Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Current Streak</span>
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-amber-400 mt-1">
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Keep daily streak alive</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Best Record</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                {bestStreak} Days
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">All-time highest streak</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Completed Days</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mt-1">
                {Object.keys(dailyResults).length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Daily sets finished</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Daily Reward</span>
                <Award className="w-4 h-4 text-blue-400" />
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-blue-400 mt-1">
                +3 Hints
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">& +50 family points</div>
            </div>
          </div>

          {/* Today's Hero Banner Card */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Today's Challenge
                </span>
                <span className="text-xs text-slate-400 font-bold bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
                  {todayChallenge.difficulty} Difficulty · 5 Brand Logos
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                {todayChallenge.title}
              </h2>
              <p className="text-sm text-slate-300">
                {todayChallenge.description}
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                <span className="text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Reward: +3 Free Hints
                </span>
                <span className="text-blue-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" /> +50 Family Points
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                id="play-daily-hero-btn"
                onClick={() => {
                  sound.playTap();
                  onPlayDaily(todayChallenge);
                }}
                className={`flex items-center gap-3 px-7 py-4 rounded-2xl font-extrabold text-base transition-all min-h-[54px] shadow-lg ${
                  isTodayCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
                }`}
              >
                {isTodayCompleted ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Replay Completed Today</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 fill-slate-950" />
                    <span>PLAY TODAY'S PUZZLE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 30-Day Streak Calendar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="font-display font-black text-xl text-white">
                  {monthName} Daily Calendar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tap any past or current day to play its historical 5-logo challenge.
                </p>
              </div>

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
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
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
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
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
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center min-h-[68px] sm:min-h-[84px] select-none ${
                      isFuture
                        ? 'bg-slate-900/30 border-slate-800/40 text-slate-600 cursor-not-allowed'
                        : isToday
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md ring-2 ring-amber-500/20 cursor-pointer hover:scale-105'
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
                        <span className="text-[10px] text-slate-500 font-bold">Play</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================= WEEKLY CHALLENGES SECTION ======================= */}
      {activeTab === 'weekly' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Week Countdown & Mega Card */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-extrabold text-xs uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Weekly Mega Event · {selectedWeeklyChallenge.weekKey}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                    {selectedWeeklyChallenge.startDate} – {selectedWeeklyChallenge.endDate}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{selectedWeeklyChallenge.badgeIcon}</span>
                  <div>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                      {selectedWeeklyChallenge.title}
                    </h2>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">
                      Theme: {selectedWeeklyChallenge.theme}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedWeeklyChallenge.description}
                </p>

                {/* Rewards Grid */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Reward: +10 Free Hints</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span>+200 Family Points</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Badge: "{selectedWeeklyChallenge.badgeName}"</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
                <button
                  id="play-weekly-btn"
                  onClick={() => {
                    sound.playTap();
                    onPlayWeekly(selectedWeeklyChallenge);
                  }}
                  className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-extrabold text-base transition-all min-h-[56px] shadow-lg w-full sm:w-auto ${
                    isSelectedWeeklyCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/30'
                  }`}
                >
                  {isSelectedWeeklyCompleted ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Replay Weekly Challenge</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 fill-white" />
                      <span>PLAY 10-LOGO CHALLENGE</span>
                    </>
                  )}
                </button>

                {isSelectedWeeklyCompleted && (
                  <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed on this profile! Score: {selectedWeeklyResult?.score || 200} pts</span>
                  </div>
                )}
              </div>
            </div>

            {/* 10 Logos Included Preview */}
            <div>
              <h4 className="font-display font-extrabold text-sm text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Featured 10-Logo Set in this Weekly Mega Challenge
              </h4>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
                {selectedWeeklyChallenge.logoIds.map((logoId, idx) => {
                  const logo = logos.find(l => l.logoId === logoId);
                  const isSolved = !!storage.getProgress(activeProfile.profileId, logoId)?.solved;

                  return (
                    <div
                      key={logoId}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all aspect-square relative ${
                        isSolved
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <span className="text-[11px] font-black text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold truncate max-w-full px-1 text-white">
                        {isSolved && logo ? logo.brandName : `???`}
                      </span>
                      {isSolved && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute top-1 right-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Past Weekly Challenges Archive */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-display font-black text-xl text-white">
                  Weekly Challenge Archive
                </h3>
                <p className="text-xs text-slate-400">
                  Select and play past weekly themes anytime for full rewards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {recentWeeks.map(wkKey => {
                const chal = getWeeklyChallengeForWeek(wkKey, logos);
                const isCompleted = !!weeklyResults[wkKey];
                const isCurrent = wkKey === currentWeekKey;
                const isSelected = wkKey === selectedWeekKey;

                return (
                  <div
                    key={wkKey}
                    onClick={() => {
                      sound.playTap();
                      setSelectedWeekKey(wkKey);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-black text-indigo-400">
                          {chal.weekKey} {isCurrent && '(Current)'}
                        </span>
                        {isCompleted ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full">
                            10 Logos
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xl">{chal.badgeIcon}</span>
                        <h4 className="font-display font-extrabold text-sm text-white line-clamp-1">
                          {chal.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {chal.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-bold">+10 Hints</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playTap();
                          onPlayWeekly(chal);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-indigo-600 text-white font-bold text-[11px] transition-colors"
                      >
                        {isCompleted ? 'Replay' : 'Play Now →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
