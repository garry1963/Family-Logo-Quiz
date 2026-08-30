import React from 'react';
import { GameMode } from '../types';
import {
  Utensils,
  Palette,
  History,
  Quote,
  Layers,
  Award,
  Zap,
  Sliders,
  Sparkles,
  Users
} from 'lucide-react';
import { sound } from '../services/soundEffects';
import { ActiveTab } from './NavigationRail';

interface SpecialModesViewProps {
  onStartMode: (mode: GameMode) => void;
  onOpenCustomQuiz: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const SpecialModesView: React.FC<SpecialModesViewProps> = ({
  onStartMode,
  onOpenCustomQuiz,
  setActiveTab
}) => {
  const modes: {
    id: GameMode | 'custom_quiz' | 'party';
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
  }[] = [
    {
      id: 'party',
      title: 'Family Game Night (Multiplayer)',
      description: 'Pass-the-tablet party mode for 2 to 8 players with custom rounds, live score tracker, and victory podium!',
      icon: <Users className="w-7 h-7 text-amber-400" />,
      color: 'border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900',
      badge: 'Local Multiplayer'
    },
    {
      id: 'food_drink',
      title: 'Food & Drink Quiz',
      description: 'Focus solely on fast food chains, soft drinks, candies, snacks, chips, and restaurant brands.',
      icon: <Utensils className="w-7 h-7 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900',
      badge: 'Family Favourite'
    },
    {
      id: 'guess_colour',
      title: 'Guess the Colour',
      description: 'Look at the monochrome outline and choose the authentic colour palette of the famous brand.',
      icon: <Palette className="w-7 h-7 text-purple-400" />,
      color: 'border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900',
      badge: 'Visual Challenge'
    },
    {
      id: 'retro',
      title: 'Retro & Vintage Logos',
      description: 'Test your historical knowledge! Can you recognise global brands from their early 1900s–1980s logos?',
      icon: <History className="w-7 h-7 text-amber-400" />,
      color: 'border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900',
      badge: 'Nostalgia'
    },
    {
      id: 'slogan',
      title: 'Famous Slogans',
      description: 'Read legendary advertising taglines ("Just Do It", "I\'m Lovin\' It") and name the company!',
      icon: <Quote className="w-7 h-7 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900',
      badge: 'Taglines'
    },
    {
      id: 'minimalist',
      title: 'Minimalist Logos',
      description: 'Geometric, stripped-down silhouettes with all typography and distinct markers removed.',
      icon: <Layers className="w-7 h-7 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900',
      badge: 'Abstract'
    },
    {
      id: 'practice',
      title: 'Relaxed Practice Mode',
      description: 'Unlimited free hints, zero penalties, and easy logo replay. Great for relaxing or younger kids.',
      icon: <Zap className="w-7 h-7 text-teal-400" />,
      color: 'border-teal-500/40 bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900',
      badge: 'Zen & Chill'
    },
    {
      id: 'expert',
      title: 'Expert Mode',
      description: 'Harder, obscure, and tricky logos with minimal letters and no starting reveals.',
      icon: <Award className="w-7 h-7 text-rose-400" />,
      color: 'border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900',
      badge: 'Master Difficulty'
    },
    {
      id: 'custom_quiz',
      title: 'Custom Quiz Builder',
      description: 'Choose your own categories, difficulty filter, and number of questions (10, 20, 50) for a tailor-made round.',
      icon: <Sliders className="w-7 h-7 text-blue-400" />,
      color: 'border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900',
      badge: 'Custom Game'
    }
  ];

  return (
    <div id="special-modes-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-blue-400" />
          Special Game Modes
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore alternative ways to test your brand memory, from vintage logos to multiplayer game night.
        </p>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modes.map(mode => (
          <div
            key={mode.id}
            id={`special-mode-card-${mode.id}`}
            onClick={() => {
              sound.playTap();
              if (mode.id === 'party') {
                setActiveTab('family_night');
              } else if (mode.id === 'custom_quiz') {
                onOpenCustomQuiz();
              } else {
                onStartMode(mode.id as GameMode);
              }
            }}
            className={`p-6 rounded-3xl border ${mode.color} hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xl select-none flex flex-col justify-between min-h-[220px]`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
                  {mode.icon}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 text-xs font-bold border border-slate-700">
                  {mode.badge}
                </span>
              </div>

              <h3 className="font-display font-black text-xl text-white mb-1.5">
                {mode.title}
              </h3>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                {mode.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-extrabold text-white">
                Launch Mode →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
