import React from 'react';
import { Trophy, Medal, Flame, Star, Award, Users, CheckCircle2 } from 'lucide-react';
import { ProfileRecord, LogoRecord } from '../types';
import { storage } from '../services/storageService';

interface FamilyLeaderboardViewProps {
  profiles: ProfileRecord[];
  logos: LogoRecord[];
  activeProfileId: string;
}

export const FamilyLeaderboardView: React.FC<FamilyLeaderboardViewProps> = ({
  profiles,
  logos,
  activeProfileId
}) => {
  const db = storage.getDatabase();

  // Compute ranking for each family member
  const rankedProfiles = profiles.map(profile => {
    const progressMap = db.progress[profile.profileId] || {};
    const solvedCount = Object.values(progressMap).filter(p => p.solved).length;
    const attempts = Object.values(progressMap).reduce((acc, p) => acc + (p.attempts || 1), 0);
    const accuracy = attempts > 0 ? Math.round((solvedCount / attempts) * 100) : 100;
    const { currentStreak, bestStreak } = storage.calculateStreak(profile.profileId);
    const badgesCount = Object.keys(db.unlockedAchievements[profile.profileId] || {}).length;
    const points = (db.gamePoints[profile.profileId] || 0) + (solvedCount * 10) + (badgesCount * 50);

    return {
      profile,
      solvedCount,
      accuracy,
      currentStreak,
      bestStreak,
      badgesCount,
      points
    };
  }).sort((a, b) => b.points - a.points);

  return (
    <div id="family-leaderboard-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
          <Trophy className="w-7 h-7 text-amber-400" />
          Family Rank & Scoreboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Compare puzzle progress and friendly standings between your household tablet profiles.
        </p>
      </div>

      {/* Podium Top 3 */}
      {rankedProfiles.length >= 2 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto pt-4 pb-2 items-end">
          {/* 2nd Place */}
          {rankedProfiles[1] && (
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">{rankedProfiles[1].profile.avatar}</div>
              <div className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{rankedProfiles[1].profile.displayName}</div>
              <div className="w-full bg-slate-800/90 border border-slate-700 rounded-t-2xl p-3 text-center mt-2 h-28 flex flex-col justify-center">
                <span className="text-xl font-black text-slate-300">#2</span>
                <span className="text-xs text-blue-400 font-extrabold">{rankedProfiles[1].points} pts</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {rankedProfiles[0] && (
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-1">{rankedProfiles[0].profile.avatar}</div>
              <div className="text-xs font-black text-amber-400 truncate max-w-[120px]">{rankedProfiles[0].profile.displayName}</div>
              <div className="w-full bg-gradient-to-t from-amber-600/40 to-amber-500/20 border-2 border-amber-400/80 rounded-t-2xl p-4 text-center mt-2 h-36 flex flex-col justify-center shadow-lg shadow-amber-500/20">
                <span className="text-2xl font-black text-amber-300">👑 #1</span>
                <span className="text-sm text-white font-extrabold">{rankedProfiles[0].points} pts</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {rankedProfiles[2] && (
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">{rankedProfiles[2].profile.avatar}</div>
              <div className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{rankedProfiles[2].profile.displayName}</div>
              <div className="w-full bg-slate-800/90 border border-slate-700 rounded-t-2xl p-3 text-center mt-2 h-24 flex flex-col justify-center">
                <span className="text-xl font-black text-amber-600">#3</span>
                <span className="text-xs text-blue-400 font-extrabold">{rankedProfiles[2].points} pts</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        {rankedProfiles.map((item, index) => {
          const isCurrent = item.profile.profileId === activeProfileId;
          return (
            <div
              key={item.profile.profileId}
              id={`leaderboard-row-${item.profile.profileId}`}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 select-none ${
                isCurrent
                  ? 'bg-blue-950/40 border-blue-500/80 shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/60 border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="font-display font-black text-lg text-slate-400 w-6 text-center">
                  #{index + 1}
                </div>
                <div className="text-3xl p-1 bg-slate-800 rounded-xl border border-slate-700 shrink-0">
                  {item.profile.avatar}
                </div>
                <div className="truncate">
                  <div className="font-display font-black text-base text-white truncate flex items-center gap-2">
                    {item.profile.displayName}
                    {isCurrent && (
                      <span className="text-[10px] bg-blue-500 text-white font-extrabold px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{item.solvedCount} Solved</span>
                    <span>·</span>
                    <span>{item.accuracy}% Accuracy</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{item.currentStreak}d</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/20">
                  <Award className="w-3.5 h-3.5" />
                  <span>{item.badgesCount}</span>
                </div>
                <div className="text-right pl-2">
                  <div className="font-display font-black text-base text-amber-400">
                    {item.points}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Points</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
