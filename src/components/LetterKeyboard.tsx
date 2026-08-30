import React, { useEffect, useMemo } from 'react';
import { Delete, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface LetterKeyboardProps {
  acceptedAnswers: string[];
  currentInput: string[];
  onLetterTap: (letter: string, tileIndex: number) => void;
  onBackspace: () => void;
  onClear: () => void;
  revealedIndices: number[]; // indices of answer locked by hint
  removedTileIndices: number[]; // indices of keyboard tiles disabled by hint
  selectedTileIndices: number[]; // indices of keyboard tiles currently placed in answer
  isIncorrectShake: boolean;
  isSolved: boolean;
}

export const LetterKeyboard: React.FC<LetterKeyboardProps> = ({
  acceptedAnswers,
  currentInput,
  onLetterTap,
  onBackspace,
  onClear,
  revealedIndices,
  removedTileIndices,
  selectedTileIndices,
  isIncorrectShake,
  isSolved
}) => {
  // Primary target answer formatted into words
  const primaryAnswer = acceptedAnswers[0] || '';
  const answerWords = primaryAnswer.split(' ');

  // Compute total letter slots (excluding non-letter characters that are pre-filled like space/hyphen/apostrophe)
  const characters = useMemo(() => {
    return primaryAnswer.split('');
  }, [primaryAnswer]);

  // Generate deterministic pool of letters (14-16 tiles) including all necessary answer letters + random decoys
  const tilePool = useMemo(() => {
    const neededLetters = primaryAnswer.replace(/[^A-Z0-9]/g, '').split('');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const pool = [...neededLetters];
    
    // Pad to 14 or 16 tiles for nice 2 rows on tablet
    const targetSize = pool.length <= 12 ? 14 : 16;
    let seed = 0;
    for (let i = 0; i < primaryAnswer.length; i++) {
      seed += primaryAnswer.charCodeAt(i);
    }

    while (pool.length < targetSize) {
      const char = alphabet[(seed + pool.length * 7) % alphabet.length];
      pool.push(char);
    }

    // Deterministic shuffle
    return pool.sort((a, b) => {
      const codeA = a.charCodeAt(0) + seed;
      const codeB = b.charCodeAt(0) + seed;
      return (codeA % 13) - (codeB % 13);
    });
  }, [primaryAnswer]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolved) return;
      if (e.key === 'Backspace') {
        onBackspace();
      } else if (e.key === 'Escape') {
        onClear();
      } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        // Find first available tile with this character
        const availableIdx = tilePool.findIndex((l, idx) => 
          l === char && 
          !selectedTileIndices.includes(idx) && 
          !removedTileIndices.includes(idx)
        );
        if (availableIdx !== -1) {
          onLetterTap(char, availableIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tilePool, selectedTileIndices, removedTileIndices, isSolved, onBackspace, onClear, onLetterTap]);

  // Group answer slots by word
  let charGlobalIndex = 0;

  return (
    <div 
      id="answer-and-keyboard-system"
      className="flex flex-col items-center justify-between w-full h-full space-y-4 md:space-y-6 select-none"
    >
      {/* Answer Slots Display */}
      <div 
        id="answer-slots-container"
        className={`w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4 px-2 bg-slate-900/40 rounded-3xl border border-slate-800/60 transition-transform ${
          isIncorrectShake ? 'animate-gentle-shake border-red-500/80 bg-red-950/20' : ''
        }`}
      >
        {answerWords.map((word, wordIdx) => {
          const wordLetters = word.split('');
          return (
            <div key={wordIdx} className="flex items-center gap-1.5 sm:gap-2">
              {wordLetters.map((char) => {
                const currentIndex = charGlobalIndex;
                charGlobalIndex++;

                const isSpecialChar = /[^A-Z0-9]/.test(char);
                const filledValue = isSpecialChar ? char : currentInput[currentIndex] || '';
                const isHintLocked = revealedIndices.includes(currentIndex);

                return (
                  <div
                    key={currentIndex}
                    className={`flex items-center justify-center rounded-xl font-display font-black text-lg sm:text-2xl md:text-3xl transition-all ${
                      isSpecialChar
                        ? 'w-6 sm:w-8 h-12 sm:h-14 text-slate-400'
                        : `w-10 sm:w-12 md:w-14 h-12 sm:h-14 md:h-16 border-2 ${
                            isSolved
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                              : filledValue
                              ? isHintLocked
                                ? 'bg-amber-500/30 border-amber-400 text-amber-300 font-extrabold'
                                : 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                              : 'bg-slate-800/80 border-slate-700 text-slate-500 border-dashed'
                          }`
                    }`}
                  >
                    {filledValue}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Letter Tiles Grid */}
      <div className="w-full max-w-xl space-y-3">
        <div className="grid grid-cols-7 sm:grid-cols-8 gap-2 sm:gap-2.5">
          {tilePool.map((letter, index) => {
            const isUsed = selectedTileIndices.includes(index);
            const isRemoved = removedTileIndices.includes(index);

            return (
              <button
                key={index}
                id={`letter-tile-${index}`}
                disabled={isUsed || isRemoved || isSolved}
                onClick={() => {
                  sound.playTap();
                  onLetterTap(letter, index);
                }}
                className={`flex items-center justify-center rounded-2xl font-display font-black text-lg sm:text-2xl min-h-[48px] sm:min-h-[54px] transition-all transform active:scale-95 ${
                  isRemoved
                    ? 'opacity-10 bg-slate-800 text-slate-600 border border-transparent cursor-not-allowed'
                    : isUsed
                    ? 'opacity-20 bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed scale-90'
                    : 'bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white border-2 border-slate-700 hover:border-blue-500 shadow-md hover:shadow-blue-500/20'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Input Helper Controls (Backspace, Clear) */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            id="backspace-answer-btn"
            disabled={isSolved || currentInput.every(c => !c)}
            onClick={() => {
              sound.playDelete();
              onBackspace();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-40 min-h-[48px]"
          >
            <Delete className="w-5 h-5 text-rose-400" />
            <span>Backspace</span>
          </button>

          <button
            id="clear-answer-btn"
            disabled={isSolved || currentInput.every(c => !c)}
            onClick={() => {
              sound.playDelete();
              onClear();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-40 min-h-[48px]"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Clear Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
