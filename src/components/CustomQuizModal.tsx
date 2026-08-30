import React, { useState } from 'react';
import { X, Sliders, Play, Check } from 'lucide-react';
import { CategoryRecord, Difficulty, LogoRecord } from '../types';
import { sound } from '../services/soundEffects';

interface CustomQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryRecord[];
  logos: LogoRecord[];
  onStartCustomQuiz: (selectedLogos: LogoRecord[]) => void;
}

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({
  isOpen,
  onClose,
  categories,
  logos,
  onStartCustomQuiz
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    sound.playTap();
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleStart = () => {
    sound.playTap();
    let pool = logos.filter(l => l.active !== false);

    if (selectedCategories.length > 0) {
      pool = pool.filter(l => selectedCategories.includes(l.categoryId));
    }

    if (selectedDifficulty !== 'all') {
      pool = pool.filter(l => l.difficulty === selectedDifficulty);
    }

    // Shuffle and pick questionCount
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    if (selected.length === 0) {
      alert('No logos matched your custom filter criteria! Please loosen your selection.');
      return;
    }

    onStartCustomQuiz(selected);
    onClose();
  };

  return (
    <div 
      id="custom-quiz-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div 
        id="custom-quiz-card"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display font-black text-2xl text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-6 h-6 text-blue-400" />
              Custom Quiz Builder
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assemble a tailored puzzle playlist for family games or solo practice.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Question count */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Number of Puzzles
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 30].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setQuestionCount(count);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all min-h-[44px] ${
                    questionCount === count
                      ? 'bg-blue-600 border-blue-400 text-white font-extrabold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {count} Logos
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['all', 'Easy', 'Medium', 'Hard', 'Expert'].map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setSelectedDifficulty(diff);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border capitalize transition-all min-h-[44px] ${
                    selectedDifficulty === diff
                      ? 'bg-blue-600 border-blue-400 text-white font-extrabold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Include Categories ({selectedCategories.length === 0 ? 'All' : `${selectedCategories.length} selected`})
              </label>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-[11px] font-bold text-blue-400 hover:underline"
                >
                  Reset to All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/40 rounded-2xl border border-slate-800">
              {categories.map(cat => {
                const isSelected = selectedCategories.includes(cat.categoryId);
                return (
                  <button
                    key={cat.categoryId}
                    type="button"
                    onClick={() => toggleCategory(cat.categoryId)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-bold transition-all min-h-[44px] ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-white'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.iconEmoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>START CUSTOM QUIZ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
