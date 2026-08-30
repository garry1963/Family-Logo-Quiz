import React, { useState } from 'react';
import { LogoRecord, GameMode } from '../types';
import { History, Eye, Palette, Quote, Sparkles, Heart } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface LogoDisplayProps {
  logo: LogoRecord;
  gameMode: GameMode;
  isSolved: boolean;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  onSelectColorChoice?: (isCorrect: boolean) => void;
}

export const LogoDisplay: React.FC<LogoDisplayProps> = ({
  logo,
  gameMode,
  isSolved,
  isFavourite,
  onToggleFavourite,
  onSelectColorChoice
}) => {
  const [showHistoricView, setShowHistoricView] = useState(false);

  // Pick appropriate SVG representation based on game mode
  let svgContent = logo.imageSvg || '';
  if (gameMode === 'minimalist' && logo.minimalistImageSvg) {
    svgContent = logo.minimalistImageSvg;
  } else if (gameMode === 'retro' && (showHistoricView || !isSolved) && logo.historicImageSvg) {
    svgContent = logo.historicImageSvg;
  }

  return (
    <div 
      id="logo-display-container"
      className="relative flex flex-col items-center justify-center w-full h-full p-4 md:p-6 bg-slate-900/60 rounded-3xl border border-slate-800/80 shadow-inner select-none overflow-hidden"
    >
      {/* Top Floating Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
            logo.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            logo.difficulty === 'Medium' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
            logo.difficulty === 'Hard' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {logo.difficulty}
          </span>
          {gameMode !== 'classic' && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
              {gameMode.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Favorite Bookmark */}
        <button
          id="toggle-favourite-btn"
          onClick={() => {
            sound.playTap();
            onToggleFavourite();
          }}
          className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isFavourite
              ? 'bg-rose-600/30 border-rose-500 text-rose-400'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={isFavourite ? 'Remove Favourite' : 'Save to Favourites'}
        >
          <Heart className={`w-5 h-5 ${isFavourite ? 'fill-rose-400' : ''}`} />
        </button>
      </div>

      {/* Slogan Banner for Slogan Mode */}
      {gameMode === 'slogan' && logo.slogan && (
        <div className="mb-4 text-center px-4 py-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl max-w-md animate-pop">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Quote className="w-4 h-4" />
            Brand Slogan
          </div>
          <div className="font-display font-extrabold text-lg md:text-xl text-white italic">
            "{logo.slogan}"
          </div>
        </div>
      )}

      {/* Retro Era Banner if Retro Mode */}
      {gameMode === 'retro' && logo.historicEra && (
        <div className="mb-3 px-3 py-1.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <History className="w-4 h-4" />
          Era: {logo.historicEra}
        </div>
      )}

      {/* Main Logo Card */}
      <div 
        id="logo-image-card"
        className={`w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-white/95 rounded-3xl p-6 sm:p-8 flex items-center justify-center shadow-2xl border-4 transition-all relative ${
          isSolved ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-slate-700/60'
        }`}
      >
        {svgContent ? (
          <div 
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-slate-400 text-center font-bold text-sm">
            [ Vector Logo ]
          </div>
        )}

        {/* Solved Overlap Checkmark */}
        {isSolved && (
          <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg animate-pop">
            ✓
          </div>
        )}
      </div>

      {/* Guess the Colour interactive choices */}
      {gameMode === 'guess_colour' && logo.colourChoices && !isSolved && (
        <div className="mt-4 w-full max-w-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
            <Palette className="w-4 h-4 text-purple-400" />
            Select the authentic brand colour:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {logo.colourChoices.map((choice, i) => (
              <button
                key={i}
                onClick={() => {
                  if (onSelectColorChoice) {
                    onSelectColorChoice(choice.isCorrect);
                  }
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-left min-h-[48px]"
              >
                <span
                  className="w-6 h-6 rounded-full border border-white/20 shrink-0 shadow"
                  style={{ backgroundColor: choice.hex }}
                />
                <span className="text-xs font-bold text-white truncate">{choice.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Retro Comparison Switcher after solving */}
      {gameMode === 'retro' && logo.historicImageSvg && isSolved && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => {
              sound.playTap();
              setShowHistoricView(!showHistoricView);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 transition-all min-h-[44px]"
          >
            <History className="w-4 h-4" />
            {showHistoricView ? 'View Modern Logo' : 'View Vintage Logo'}
          </button>
        </div>
      )}
    </div>
  );
};
