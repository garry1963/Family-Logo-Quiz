import React from 'react';
import { Lock, Star, Play, CheckCircle, ChevronRight, Award } from 'lucide-react';
import { LevelRecord, LogoRecord, ProfileRecord } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

interface LevelsViewProps {
  levels: LevelRecord[];
  logos: LogoRecord[];
  activeProfile: ProfileRecord;
  onSelectLevel: (levelNumber: number) => void;
}

export const LevelsView: React.FC<LevelsViewProps> = ({
  levels,
  logos,
  activeProfile,
  onSelectLevel
}) => {
  return (
    <div id="levels-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Main Levels Campaign
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            52 main levels with progressive difficulties and star ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-500/30">
            52 Levels Total
          </span>
        </div>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {levels.map(lvl => {
          const isUnlocked = storage.isLevelUnlocked(activeProfile.profileId, lvl.levelNumber);
          const stars = storage.getLevelStars(activeProfile.profileId, lvl.levelNumber);
          
          // Count logos in level
          const levelLogos = logos.filter(l => l.levelNumber === lvl.levelNumber && l.active !== false);
          const solvedInLevel = levelLogos.filter(l => storage.getProgress(activeProfile.profileId, l.logoId)?.solved).length;
          const isComplete = levelLogos.length > 0 && solvedInLevel === levelLogos.length;

          return (
            <div
              key={lvl.levelId}
              id={`level-card-${lvl.levelNumber}`}
              onClick={() => {
                if (isUnlocked) {
                  sound.playTap();
                  onSelectLevel(lvl.levelNumber);
                } else {
                  sound.playIncorrect();
                }
              }}
              className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between select-none ${
                !isUnlocked
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                  : isComplete
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 hover:scale-[1.02] cursor-pointer shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-blue-500/60 hover:scale-[1.02] cursor-pointer shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                    lvl.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
                    lvl.difficulty === 'Medium' ? 'bg-blue-500/20 text-blue-300' :
                    lvl.difficulty === 'Hard' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {lvl.difficulty}
                  </span>

                  {!isUnlocked ? (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                      <Lock className="w-4 h-4" /> Locked
                    </span>
                  ) : isComplete ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </span>
                  ) : null}
                </div>

                <div className="font-display font-black text-xl text-white mb-1">
                  LEVEL {lvl.levelNumber}
                </div>
                <div className="text-xs text-slate-400 font-medium truncate mb-4">
                  {lvl.name}
                </div>

                {/* Star Rating Display */}
                {isUnlocked && (
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(starIdx => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Solved stats / unlock progress */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {isUnlocked ? (
                  <>
                    <span className="text-slate-300 font-bold">
                      {solvedInLevel} / {Math.max(1, levelLogos.length)} Solved
                    </span>
                    <span className="text-blue-400 font-extrabold flex items-center gap-0.5">
                      Play <ChevronRight className="w-4 h-4" />
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 font-medium">
                    Requires {lvl.unlockRequirement.requiredLogosSolved} total solved
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
