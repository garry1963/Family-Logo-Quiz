import React from 'react';
import { X, Sparkles, Wand2, Trash2, Key, Info, HelpCircle, CheckCircle } from 'lucide-react';
import { HintType, LogoRecord } from '../types';
import { sound } from '../services/soundEffects';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  logo: LogoRecord;
  hintBalance: number;
  isUnlimitedHints: boolean;
  categoryClueShown: boolean;
  categoryName: string;
  onUseHint: (hintType: HintType) => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  logo,
  hintBalance,
  isUnlimitedHints,
  categoryClueShown,
  categoryName,
  onUseHint
}) => {
  if (!isOpen) return null;

  const hintOptions: {
    type: HintType;
    title: string;
    description: string;
    icon: React.ReactNode;
    cost: number;
    color: string;
    alreadyUsed?: boolean;
    clueText?: string;
  }[] = [
    {
      type: 'first_letter',
      title: 'Reveal First Letter',
      description: 'Places the first letter of the brand into the starting slot.',
      icon: <Key className="w-6 h-6 text-amber-400" />,
      cost: 1,
      color: 'border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30'
    },
    {
      type: 'reveal_letter',
      title: 'Reveal Random Letter',
      description: 'Reveals one missing letter in its correct position.',
      icon: <Wand2 className="w-6 h-6 text-blue-400" />,
      cost: 1,
      color: 'border-blue-500/40 bg-blue-950/20 hover:bg-blue-900/30'
    },
    {
      type: 'remove_letters',
      title: 'Remove Incorrect Tiles',
      description: 'Clears away wrong keyboard letters so only useful letters remain.',
      icon: <Trash2 className="w-6 h-6 text-rose-400" />,
      cost: 1,
      color: 'border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/30'
    },
    {
      type: 'category_clue',
      title: 'Category Clue',
      description: categoryClueShown ? `Category: "${categoryName}"` : 'Displays the industry / category of this brand.',
      icon: <Info className="w-6 h-6 text-emerald-400" />,
      cost: 1,
      color: 'border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/30',
      alreadyUsed: categoryClueShown,
      clueText: categoryClueShown ? categoryName : undefined
    },
    {
      type: 'reveal_answer',
      title: 'Solve & Reveal Brand',
      description: 'Fills the complete answer immediately.',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      cost: 2,
      color: 'border-purple-500/40 bg-purple-950/20 hover:bg-purple-900/30'
    }
  ];

  return (
    <div 
      id="hint-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        id="hint-modal-card"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display font-black text-2xl text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              Need a Hint?
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              100% Free gameplay hints — no purchases or real currency ever!
            </p>
          </div>
          <button
            id="close-hint-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hint Balance Banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💡</span>
            <div>
              <div className="text-xs text-slate-400 font-medium">Your Hint Balance</div>
              <div className="text-sm font-black text-white">
                {isUnlimitedHints ? 'Unlimited Free Hints (Relaxed Family Mode)' : `${hintBalance} Hints Available`}
              </div>
            </div>
          </div>
          {isUnlimitedHints && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              Active
            </span>
          )}
        </div>

        {/* Hint Options List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {hintOptions.map(hint => {
            const canAfford = isUnlimitedHints || hintBalance >= hint.cost;
            return (
              <button
                key={hint.type}
                id={`hint-option-${hint.type}`}
                disabled={!canAfford || (hint.type === 'category_clue' && hint.alreadyUsed)}
                onClick={() => {
                  sound.playHint();
                  onUseHint(hint.type);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left min-h-[64px] ${hint.color} ${
                  !canAfford ? 'opacity-40 cursor-not-allowed' : 'active:scale-98'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                    {hint.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                      {hint.title}
                      {hint.clueText && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                          {hint.clueText}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {hint.description}
                    </div>
                  </div>
                </div>

                <div className="pl-3 shrink-0 text-right">
                  {isUnlimitedHints ? (
                    <span className="text-xs font-bold text-emerald-400">FREE</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400">
                      -{hint.cost} 💡
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Earn more free hints by solving logos, clearing levels, and daily streaks.
          </p>
        </div>
      </div>
    </div>
  );
};
