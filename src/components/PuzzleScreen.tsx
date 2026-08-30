import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Heart,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { LogoRecord, GameMode, HintType, ProfileRecord } from '../types';
import { LogoDisplay } from './LogoDisplay';
import { LetterKeyboard } from './LetterKeyboard';
import { HintModal } from './HintModal';
import { BrandInfoModal } from './BrandInfoModal';
import { sound } from '../services/soundEffects';

interface PuzzleScreenProps {
  logos: LogoRecord[];
  currentIndex: number;
  onNavigateIndex: (index: number) => void;
  onBack: () => void;
  activeProfile: ProfileRecord;
  gameMode: GameMode;
  levelNumber?: number;
  isSolved: boolean;
  onSolve: (hintsUsed: number, hintsRevealedIndices: number[], lettersRemoved: string[], categoryClueShown: boolean) => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  hintBalance: number;
  isUnlimitedHints: boolean;
  onUseHintDeduct: (cost: number) => boolean;
  categoryName: string;
  swipeNavigationEnabled: boolean;
  initialHintsRevealedIndices?: number[];
  initialLettersRemoved?: string[];
  initialCategoryClueShown?: boolean;
}

export const PuzzleScreen: React.FC<PuzzleScreenProps> = ({
  logos,
  currentIndex,
  onNavigateIndex,
  onBack,
  activeProfile,
  gameMode,
  levelNumber,
  isSolved,
  onSolve,
  isFavourite,
  onToggleFavourite,
  hintBalance,
  isUnlimitedHints,
  onUseHintDeduct,
  categoryName,
  swipeNavigationEnabled,
  initialHintsRevealedIndices = [],
  initialLettersRemoved = [],
  initialCategoryClueShown = false
}) => {
  const currentLogo = logos[currentIndex] || logos[0];

  // State
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>(initialHintsRevealedIndices);
  const [removedTileIndices, setRemovedTileIndices] = useState<number[]>([]);
  const [categoryClueShown, setCategoryClueShown] = useState<boolean>(initialCategoryClueShown);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [isIncorrectShake, setIsIncorrectShake] = useState<boolean>(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);
  const [isBrandInfoModalOpen, setIsBrandInfoModalOpen] = useState<boolean>(false);

  // Swipe navigation tracking
  const touchStartXRef = useRef<number | null>(null);

  // Normalize target answer
  const primaryAnswer = currentLogo.acceptedAnswers[0].toUpperCase();
  const normalizedAnswerLetters = primaryAnswer.replace(/[^A-Z0-9]/g, '');

  // Reset state on logo change
  useEffect(() => {
    setRevealedIndices(initialHintsRevealedIndices);
    setCategoryClueShown(initialCategoryClueShown);
    setHintsUsedCount(0);
    setRemovedTileIndices([]);
    setIsIncorrectShake(false);

    if (isSolved) {
      // Pre-fill answer if already solved
      const full = primaryAnswer.split('');
      setCurrentInput(full);
      setSelectedTileIndices([]);
    } else {
      // Fill slots, including pre-revealed letters and non-alphanumeric chars
      const initialSlots: string[] = [];
      for (let i = 0; i < primaryAnswer.length; i++) {
        const char = primaryAnswer[i];
        if (/[^A-Z0-9]/.test(char)) {
          initialSlots.push(char);
        } else if (initialHintsRevealedIndices.includes(i)) {
          initialSlots.push(char);
        } else {
          initialSlots.push('');
        }
      }
      setCurrentInput(initialSlots);
      setSelectedTileIndices([]);
    }
  }, [currentLogo.logoId, isSolved, primaryAnswer, initialHintsRevealedIndices, initialCategoryClueShown]);

  // Check if filled answer is correct
  const checkAnswer = (inputSlots: string[]) => {
    const enteredString = inputSlots.join('').toUpperCase();
    const cleanEntered = enteredString.replace(/[^A-Z0-9]/g, '');

    // Check against all accepted variants
    const isMatch = currentLogo.acceptedAnswers.some(ans => {
      const cleanAns = ans.replace(/[^A-Z0-9]/g, '').toUpperCase();
      return cleanEntered === cleanAns;
    });

    if (isMatch) {
      sound.playCorrect();
      onSolve(hintsUsedCount, revealedIndices, [], categoryClueShown);
      setIsBrandInfoModalOpen(true);
    } else {
      sound.playIncorrect();
      setIsIncorrectShake(true);
      setTimeout(() => setIsIncorrectShake(false), 600);
    }
  };

  // Handle letter tap
  const handleLetterTap = (letter: string, tileIndex: number) => {
    if (isSolved) return;

    // Find next empty slot
    const nextSlotIdx = currentInput.findIndex((c, i) => !c && !/[^A-Z0-9]/.test(primaryAnswer[i]));
    if (nextSlotIdx !== -1) {
      const updated = [...currentInput];
      updated[nextSlotIdx] = letter;
      setCurrentInput(updated);
      setSelectedTileIndices([...selectedTileIndices, tileIndex]);

      // If all letters filled, verify
      const isComplete = updated.every((c, i) => c !== '' || /[^A-Z0-9]/.test(primaryAnswer[i]));
      if (isComplete) {
        checkAnswer(updated);
      }
    }
  };

  // Backspace
  const handleBackspace = () => {
    if (isSolved) return;
    // Find last filled non-hint-locked slot
    for (let i = currentInput.length - 1; i >= 0; i--) {
      if (currentInput[i] && !revealedIndices.includes(i) && !/[^A-Z0-9]/.test(primaryAnswer[i])) {
        const updated = [...currentInput];
        updated[i] = '';
        setCurrentInput(updated);

        // Remove corresponding tile from selected
        const updatedTiles = [...selectedTileIndices];
        updatedTiles.pop();
        setSelectedTileIndices(updatedTiles);
        break;
      }
    }
  };

  // Clear answer
  const handleClear = () => {
    if (isSolved) return;
    const cleared: string[] = [];
    for (let i = 0; i < primaryAnswer.length; i++) {
      if (/[^A-Z0-9]/.test(primaryAnswer[i])) {
        cleared.push(primaryAnswer[i]);
      } else if (revealedIndices.includes(i)) {
        cleared.push(primaryAnswer[i]);
      } else {
        cleared.push('');
      }
    }
    setCurrentInput(cleared);
    setSelectedTileIndices([]);
  };

  // 5 Hints Handler
  const handleUseHint = (hintType: HintType) => {
    const cost = hintType === 'reveal_answer' ? 2 : 1;
    if (!onUseHintDeduct(cost)) return;

    setHintsUsedCount(prev => prev + 1);

    if (hintType === 'first_letter') {
      const firstUnrevealed = primaryAnswer.split('').findIndex((char, idx) => 
        !revealedIndices.includes(idx) && /[A-Z0-9]/.test(char)
      );
      if (firstUnrevealed !== -1) {
        const newRevealed = [...revealedIndices, firstUnrevealed];
        setRevealedIndices(newRevealed);
        const updated = [...currentInput];
        updated[firstUnrevealed] = primaryAnswer[firstUnrevealed];
        setCurrentInput(updated);
      }
    } else if (hintType === 'reveal_letter') {
      const unrevealedIndices = primaryAnswer.split('').map((c, i) => i).filter(idx => 
        !revealedIndices.includes(idx) && /[A-Z0-9]/.test(primaryAnswer[idx])
      );
      if (unrevealedIndices.length > 0) {
        const randomIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
        const newRevealed = [...revealedIndices, randomIdx];
        setRevealedIndices(newRevealed);
        const updated = [...currentInput];
        updated[randomIdx] = primaryAnswer[randomIdx];
        setCurrentInput(updated);
      }
    } else if (hintType === 'category_clue') {
      setCategoryClueShown(true);
    } else if (hintType === 'remove_letters') {
      // Remove 3 incorrect tiles from keyboard
      // (This will disable decoy letter indices)
      const neededLetters = primaryAnswer.replace(/[^A-Z0-9]/g, '').split('');
      const newlyRemoved: number[] = [];
      for (let i = 0; i < 16; i++) {
        if (!removedTileIndices.includes(i) && !selectedTileIndices.includes(i)) {
          newlyRemoved.push(i);
          if (newlyRemoved.length >= 3) break;
        }
      }
      setRemovedTileIndices(prev => [...prev, ...newlyRemoved]);
    } else if (hintType === 'reveal_answer') {
      const full = primaryAnswer.split('');
      setCurrentInput(full);
      sound.playCorrect();
      onSolve(hintsUsedCount + 1, Array.from({ length: primaryAnswer.length }, (_, i) => i), [], categoryClueShown);
      setIsBrandInfoModalOpen(true);
    }
  };

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeNavigationEnabled) return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeNavigationEnabled || touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    if (Math.abs(diff) > 70) {
      if (diff < 0 && currentIndex < logos.length - 1) {
        // Swipe left -> Next
        sound.playTap();
        onNavigateIndex(currentIndex + 1);
      } else if (diff > 0 && currentIndex > 0) {
        // Swipe right -> Prev
        sound.playTap();
        onNavigateIndex(currentIndex - 1);
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      id="puzzle-screen-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-[calc(100vh-65px)] md:h-screen w-full bg-slate-950 select-none overflow-hidden"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            id="puzzle-back-button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-base text-white flex items-center gap-2">
              {gameMode === 'classic'
                ? `Level ${levelNumber || currentLogo.levelNumber}`
                : gameMode === 'weekly'
                ? 'Weekly Mega Challenge'
                : gameMode === 'daily'
                ? 'Daily Challenge'
                : gameMode === 'family_night'
                ? 'Family Game Night'
                : gameMode.replace('_', ' ').toUpperCase()}
              {isSolved && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              )}
            </h2>
            <div className="text-xs text-slate-400">
              Puzzle {currentIndex + 1} of {logos.length}
            </div>
          </div>
        </div>

        {/* Level Progress Bar Indicator in Header */}
        <div className="hidden sm:flex items-center gap-2 max-w-xs flex-1 mx-6">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(((currentIndex + 1) / logos.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Hint Trigger & Info */}
        <div className="flex items-center gap-2.5">
          {isSolved && (
            <button
              onClick={() => setIsBrandInfoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 min-h-[44px]"
            >
              <Info className="w-4 h-4 text-blue-400" />
              <span>Trivia</span>
            </button>
          )}

          <button
            id="open-hints-button"
            onClick={() => {
              sound.playTap();
              setIsHintModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-extrabold transition-all min-h-[44px] active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{isUnlimitedHints ? 'Hints (∞)' : `Hints (${hintBalance})`}</span>
          </button>
        </div>
      </header>

      {/* Main Tablet Body: Landscape 2 Columns / Portrait Stacked */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 p-4 sm:p-6 overflow-y-auto">
        {/* Left Side: Large Logo Display Card (5 Cols on Tablet) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center min-h-[250px] lg:min-h-0">
          <LogoDisplay
            logo={currentLogo}
            gameMode={gameMode}
            isSolved={isSolved}
            isFavourite={isFavourite}
            onToggleFavourite={onToggleFavourite}
            onSelectColorChoice={(isCorrect) => {
              if (isCorrect) {
                sound.playCorrect();
                onSolve(hintsUsedCount, [], [], categoryClueShown);
                setIsBrandInfoModalOpen(true);
              } else {
                sound.playIncorrect();
                setIsIncorrectShake(true);
                setTimeout(() => setIsIncorrectShake(false), 500);
              }
            }}
          />
        </div>

        {/* Right Side: Answer Slots & Letter Tiles & Controls (7 Cols on Tablet) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex-1 flex flex-col justify-center">
            <LetterKeyboard
              acceptedAnswers={currentLogo.acceptedAnswers}
              currentInput={currentInput}
              onLetterTap={handleLetterTap}
              onBackspace={handleBackspace}
              onClear={handleClear}
              revealedIndices={revealedIndices}
              removedTileIndices={removedTileIndices}
              selectedTileIndices={selectedTileIndices}
              isIncorrectShake={isIncorrectShake}
              isSolved={isSolved}
            />
          </div>

          {/* Navigation Controls (Prev / Next Buttons) */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              id="prev-puzzle-btn"
              disabled={currentIndex <= 0}
              onClick={() => {
                sound.playTap();
                onNavigateIndex(currentIndex - 1);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 min-h-[48px] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>PREVIOUS</span>
            </button>

            <span className="text-xs font-semibold text-slate-500">
              Swipe left/right to browse
            </span>

            <button
              id="next-puzzle-btn"
              disabled={currentIndex >= logos.length - 1}
              onClick={() => {
                sound.playTap();
                onNavigateIndex(currentIndex + 1);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 min-h-[48px] transition-all"
            >
              <span>NEXT</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Hint Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        logo={currentLogo}
        hintBalance={hintBalance}
        isUnlimitedHints={isUnlimitedHints}
        categoryClueShown={categoryClueShown}
        categoryName={categoryName}
        onUseHint={handleUseHint}
      />

      {/* Brand Trivia Celebration Modal */}
      <BrandInfoModal
        isOpen={isBrandInfoModalOpen}
        onClose={() => setIsBrandInfoModalOpen(false)}
        onNextLogo={() => {
          setIsBrandInfoModalOpen(false);
          if (currentIndex < logos.length - 1) {
            onNavigateIndex(currentIndex + 1);
          }
        }}
        logo={currentLogo}
        hasNext={currentIndex < logos.length - 1}
      />
    </div>
  );
};
