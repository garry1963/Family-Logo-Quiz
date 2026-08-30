import React, { useEffect } from 'react';
import { X, ArrowRight, Sparkles, Globe, Calendar, Building2, Lightbulb, Quote, Trophy } from 'lucide-react';
import { LogoRecord } from '../types';
import confetti from 'canvas-confetti';
import { sound } from '../services/soundEffects';

interface BrandInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLogo: () => void;
  logo: LogoRecord;
  hasNext: boolean;
}

export const BrandInfoModal: React.FC<BrandInfoModalProps> = ({
  isOpen,
  onClose,
  onNextLogo,
  logo,
  hasNext
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playFanfare();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe catch
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="brand-info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div 
        id="brand-info-card"
        className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col animate-pop"
      >
        {/* Celebration Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Trophy className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
                Correct Answer!
              </span>
              <h2 className="font-display font-black text-2xl text-white tracking-tight leading-tight">
                {logo.brandName}
              </h2>
            </div>
          </div>
          <button
            id="close-brand-info-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Details Scroll Area */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          {/* Logo visual badge */}
          <div className="w-full flex justify-center py-2">
            <div className="w-28 h-28 bg-white/95 rounded-2xl p-4 flex items-center justify-center shadow-lg border border-slate-700">
              <div 
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: logo.imageSvg || '' }}
              />
            </div>
          </div>

          {/* Slogan if available */}
          {logo.slogan && (
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-center">
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                <Quote className="w-3.5 h-3.5" />
                Famous Slogan
              </div>
              <div className="font-display font-extrabold text-base text-white italic">
                "{logo.slogan}"
              </div>
            </div>
          )}

          {/* Key Facts Pill Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Origin Country
              </div>
              <div className="text-sm font-bold text-white truncate">
                {logo.country}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Founded
              </div>
              <div className="text-sm font-bold text-white truncate">
                {logo.foundedYear}
              </div>
            </div>

            <div className="col-span-2 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Industry
              </div>
              <div className="text-sm font-bold text-white truncate">
                {logo.industry}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">
              {logo.description}
            </p>
          </div>

          {/* Interesting Fact */}
          {logo.interestingFact && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
              <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                Did You Know?
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {logo.interestingFact}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all min-h-[48px]"
          >
            Review Puzzle
          </button>

          {hasNext && (
            <button
              id="next-logo-from-modal-btn"
              onClick={() => {
                sound.playTap();
                onNextLogo();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all min-h-[48px]"
            >
              <span>Next Logo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
